import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { TimersService } from '../../../core/services/timers.service';
import { CalendarEvent, TransformedEvent } from '../components/interfaces/calendar.interfaces';
import { environment } from '../../../../environments/environment';
import { IconRendererData } from '../../../shared/components/icon-renderer/icon-renderer.component';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private callCount = 0;
  // private calendarEventURL = `${environment.backendCalendarUrl}`;
  private calendarEventURL = `http://localhost:3000/api/calendar`;

  private calendarEventsSubject$ = new BehaviorSubject<CalendarEvent[]>([]);
  readonly calendarEvents$ = this.calendarEventsSubject$.asObservable();

  private readonly eventsListSubject = new BehaviorSubject<TransformedEvent[]>([])
  eventsList$ = this.eventsListSubject.asObservable();

  // Subjects für die heutige und zukünftige Event-Liste
  private todayEventsSubject$ = new BehaviorSubject<TransformedEvent[]>([]);
  readonly todayEvents$ = this.todayEventsSubject$.asObservable();

  private futureEventsSubject$ = new BehaviorSubject<TransformedEvent[]>([]);
  readonly futureEvents$ = this.futureEventsSubject$.asObservable();

  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  // Paginierungsparameter
  public currentPage = 0;
  public pageSize = 7;
  public totalItems = 0;

  constructor(
    private http: HttpClient,
    private timersService: TimersService,
  ) {
    this.initializeCalendarEvents();     // Initialisiere die Daten
    this.eventsList(); // Kompaktes Event erstellen
  }

  // Holt täglich CalendarEvents
  initializeCalendarEvents(): void {
    this.timersService.getDailyTimer()
      .pipe(
        startWith(0),
        switchMap(() => this.fetchCalendarEvents()),
        tap(data => console.log('initializeCalendarEvents', data)),
        catchError(err => {
          console.error('API-Fehler:', err);
          return of([]);
        })
      )
      .subscribe(data => this.calendarEventsSubject$.next(data));
  }

  // API-Daten abrufen
  private fetchCalendarEvents(): Observable<CalendarEvent[]> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<CalendarEvent[]>(this.calendarEventURL).pipe(
      tap(events => console.log(`fetchCalendarEvents API Call #${currentCall}:`, events)),
      catchError(err => {
        console.error(`Fehler bei API Call #${currentCall}:`, err);
        return of([]);
      })
    );
  }

  // Event-Liste verarbeiten
  eventsList(): void {
    this.calendarEvents$.pipe(
      map((events) => {
        console.log('eventsList', events);
        const today = new Date();

        // Heutige Events filtern (vor der Transformation)
        const todayEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date || '');
          return eventDate.toDateString() === today.toDateString();
        });

        // Zukünftige Events filtern (vor der Transformation)
        const futureEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date || '');
          return eventDate.toDateString() !== today.toDateString();
        });

        // Transformation auf getrennte Arrays anwenden
        const transformedTodayEvents = this.transformToCardData(todayEvents);
        const transformedFutureEvents = this.transformToCardData(futureEvents);

        console.log('todays Events', this.todayEventsSubject$)
        // Heutige und zukünftige Events in ihre Subjects speichern
        this.todayEventsSubject$.next(transformedTodayEvents);
        this.futureEventsSubject$.next(transformedFutureEvents);

        // Rückgabe der zukünftigen Events für Debugging oder Weiterverarbeitung
        return transformedFutureEvents;
      }),
      tap(data => {
        console.log('Verarbeitete zukünftige Events:', data);
        this.totalItems = data.length; // Gesamtanzahl der zukünftigen Events setzen
      }),
      catchError((err) => {
        console.error('Fehler bei der Verarbeitung von Events:', err);
        return of([] as TransformedEvent[]);
      })
    ).subscribe(data => {
      this.eventsListSubject.next(data); // Jetzt korrekt getypt
    });
  }

  // Transformiert Event-Daten in Card-Daten
  private transformToCardData(events: CalendarEvent[]): TransformedEvent[] {
    return events.map(event => {
      const isAllDayEvent = !!event.start.date; // Prüft, ob es ein Ganztages-Event ist
      const date = new Date(event.start.dateTime || event.start.date || '');
      return {
        day: this.getDayLabel(date),
        date: this.formatDate(date), // Formatiertes Datum
        title: event.summary, // Event-Titel
        time: isAllDayEvent ? null : this.formatTime(new Date(event.start.dateTime!)), // Nur für Events mit Uhrzeit
        icon: this.getCustomIconForEvent(event),
      };
    });
  }

  get paginatedData$(): Observable<TransformedEvent[]> {
    return combineLatest([this.futureEvents$, this.currentPage$]).pipe(
      map(([events, currentPage]) => {
        const startIndex = currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const paginated = events.slice(startIndex, endIndex);
        return paginated;
      })
    );
  }

  // Paginierungsänderung verarbeiten
  onPageChange(newPage: number): void {
    this.currentPage = newPage; // Optional: bleibt für Debugging hier
    this.currentPageSubject.next(newPage); // Synchronisiert den neuen Wert mit currentPage$
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  private getDayLabel(date: Date): string | null {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Morgen';
    }
    return null; // Für alle anderen Tage kein Label
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  private getCustomIconForEvent(event: CalendarEvent): IconRendererData {
    const summary = event.summary || ''; // Fallback für leere oder fehlende Werte
    const matchingKeyword = Object.keys(this.keywordIconMap).find(keyword =>
      summary.includes(keyword)
    );

    if (matchingKeyword) {
      return this.keywordIconMap[matchingKeyword];
    }

    return this.getIconForCreatorAndOrganizer(event) || { iconType: 'font', icon: 'event' }; // Fallback-Icon
  }

  private getIconForCreatorAndOrganizer(event: CalendarEvent): IconRendererData {
    const creatorEmail = event.creator?.email || 'unknown';
    const organizerEmail = event.organizer?.email || 'unknown';
    const iconKey = `${creatorEmail}_${organizerEmail}`;

    return this.iconMapping[iconKey] || { iconType: 'font', icon: 'event' }; // Fallback-Icon
  }

  private readonly keywordIconMap: Record<string, IconRendererData> = {
    'Full moon': { iconType: 'svg', icon: 'full_moon' },
    'First quarter': { iconType: 'svg', icon: 'first_quarter' },
    'New moon': { iconType: 'svg', icon: 'new_moon' },
    'Last quarter': { iconType: 'svg', icon: 'last_quarter' },
    'Putzen': { iconType: 'font', icon: 'mop' },
    'Hausmann': { iconType: 'font', icon: 'mop' },
    'Aufräumen': { iconType: 'font', icon: 'mop' },
    'Haushaltshilfe': { iconType: 'font', icon: 'mop' },
    // 'Arzt': { iconType: 'svg', icon: 'dentistry' },
    // 'Zahnarzt': { iconType: 'svg', icon: 'dentist' },
    // 'Hausarzt': { iconType: 'font', icon: 'home_health' },
    // 'Orthopäde': { iconType: 'font', icon: 'rheumatology' },
    // 'Neurolog': { iconType: 'font', icon: 'neurology' },
    // 'Psycho': { iconType: 'font', icon: 'psychiatry' },
    // 'Physio': { iconType: 'font', icon: 'spa' },
    // 'Massage': { iconType: 'font', icon: 'spa' },
    //person 1
    //person 2
    'Frühling': { iconType: 'svg', icon: 'spring' },
    'Sommer': { iconType: 'svg', icon: 'summer' },
    'Herbst': { iconType: 'svg', icon: 'autumn' },
    'Winter': { iconType: 'svg', icon: 'winter' },
    'Wintersonnenwende': { iconType: 'font', icon: 'star' },
    'Sommersonnenwende': { iconType: 'font', icon: 'star' },
    'Heiligabend': { iconType: 'font', icon: 'featured_seasonal_and_gifts' },
    'Weihnachten': { iconType: 'font', icon: 'featured_seasonal_and_gifts' },
    'Halloween': { iconType: 'svg', icon: 'featured_seasonal_and_gifts' },
    'Reformationstag': { iconType: 'svg', icon: 'featured_seasonal_and_gifts' },
    'Ostern': { iconType: 'svg', icon: 'featured_seasonal_and_gifts' },
    'Valentinsday': { iconType: 'svg', icon: 'valentinsedays' },
    'Advent': { iconType: 'svg', icon: 'candle' },
  };

  private readonly iconMapping: Record<string, IconRendererData> = {
    // Diese Mapping-Tabelle enthält alle Kombinationen von Creator (email) und Organizer (email) und das dazugehörige Icon

    [`${environment.PERSON1_EMAIL}_${environment.HOUSEHOLD_CALENDAR_MAIL}`]: { iconType: 'font', icon: 'face_4' },
    [`${environment.PERSON2_EMAIL}_${environment.HOUSEHOLD_CALENDAR_MAIL}`]: { iconType: 'font', icon: 'face_6' },
    [`${environment.PERSON1_EMAIL}_${environment.BIRTHDAY_CALENDAR_MAIL}`]: { iconType: 'svg', icon: 'birthday' },
    [`${environment.HOLIDAY_CALENDAR_MAIL}_${environment.HOLIDAY_CALENDAR_MAIL}`]: { iconType: 'svg', icon: 'shooting_star' },
    [`${environment.MOON_CALENDAR_MAIL}_${environment.MOON_CALENDAR_MAIL}`]: { iconType: 'font', icon: 'circle' },
    // Weitere Kombinationen hier hinzufügen ...
  }
}
