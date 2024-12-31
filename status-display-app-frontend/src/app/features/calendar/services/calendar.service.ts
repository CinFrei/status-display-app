import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, partition, ReplaySubject, startWith, switchMap, tap } from 'rxjs';
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
  // private calendarEventURL = `http://backend:3000/api/calendar`;

  private apiCalendarEventsSubject$ = new BehaviorSubject<CalendarEvent[]>([]);
  readonly apiCalendarEvents$ = this.apiCalendarEventsSubject$.asObservable();

  // Subjects für heutige und zukünftige Events
  private todayEventsSubject$ = new ReplaySubject<TransformedEvent[]>(1);
  private futureEventsSubject$ = new ReplaySubject<TransformedEvent[]>(1);

  // Public Observables
  readonly todayEvents$ = this.todayEventsSubject$.asObservable();
  readonly futureEvents$ = this.futureEventsSubject$.asObservable();

  // Paginierungsparameter
  public currentPage = 0;
  public pageSize = 6;
  public totalItems = 0;

  constructor(
    private http: HttpClient,
    private timersService: TimersService,
  ) {
    this.initializeCalendarEvents();     // Initialisiere die Daten
    this.eventsList(); // Kompaktes Event erstellen
  }

  // API-Daten abrufen
  private fetchCalendarEvents(): Observable<CalendarEvent[]> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<CalendarEvent[]>(this.calendarEventURL).pipe(
      // tap(events => console.log(`fetchCalendarEvents API Call #${currentCall}:`, events)),
      catchError(err => {
        console.error(`Fehler bei API Call #${currentCall}:`, err);
        return of([]);
      })
    );
  }

  // Holt 15minlich apiCalendarEvents und packt sie in apiCalendarEventsSubject$
  initializeCalendarEvents(): void {
    this.timersService.getQuarterHourTimer()
      .pipe(
        startWith(0),
        switchMap(() => this.fetchCalendarEvents()),
        // tap(data => console.log('initializeAPICalendarEvents', data)),
        catchError(err => {
          console.error('API-Fehler:', err);
          return of([]);
        })
      )
      .subscribe(data => this.apiCalendarEventsSubject$.next(data));
  }



  // apiCalendarEvents verarbeiten zu Event-Liste
  eventsList(): void {
    this.apiCalendarEvents$.pipe(
      map(events => {
        const today = new Date();

        // Heutige Events filtern
        const todayEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date || '');
          return eventDate.toDateString() === today.toDateString();
        });

        // Zukünftige Events filtern
        const futureEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date || '');
          return eventDate.toDateString() !== today.toDateString();
        });

        return { todayEvents, futureEvents };
      }),
      map(({ todayEvents, futureEvents }) => {
        // Transformation auf getrennte Arrays anwenden
        // Fallback-Daten hinzufügen, wenn todayEvents leer ist
        const transformedTodayEvents = todayEvents.length > 0
          ? this.transformToCardData(todayEvents)
          : this.getEmptyEventForToday();
        const transformedFutureEvents = this.transformToCardData(futureEvents);

        // Heutige und zukünftige Events in ihre Subjects speichern
        this.todayEventsSubject$.next(transformedTodayEvents);
        this.futureEventsSubject$.next(transformedFutureEvents);

        // Rückgabe der zukünftigen Events für Debugging oder Weiterverarbeitung
        return { transformedTodayEvents, transformedFutureEvents };
      }),
      tap(data => {
        this.totalItems = data.transformedTodayEvents.length + data.transformedFutureEvents.length; // Gesamtanzahl der zukünftigen Events setzen
      }),
      catchError(err => {
        console.error('Fehler bei der Verarbeitung von Events:', err);
        this.todayEventsSubject$.next([]); // Leere Werte im Fehlerfall
        this.futureEventsSubject$.next([]);
        return of([] as TransformedEvent[]);
      })
    ).subscribe();
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

  private getEmptyEventForToday(): TransformedEvent[] {
    const today = new Date();
    return [
      {
        day: this.getDayLabel(today),
        date: this.formatDate(today),
        title: 'Juhu, es gibt nichts zu tun!',
        time: null,
        icon: { iconType: 'svg', icon: 'shooting_star' },
      },
    ];
  }

  get paginatedData$(): Observable<TransformedEvent[]> {
    return combineLatest([this.futureEvents$, this.todayEvents$]).pipe(
      map(([futureEvents, todayEvents]) => {
        const todayCount = todayEvents.length;
        const startIndex = this.currentPage * this.pageSize;
        let adjustedStartIndex: number;
        let adjustedEndIndex: number;

        if (this.currentPage === 0) {
          // Auf Seite 0 berücksichtigen wir die heutigen Events
          adjustedStartIndex = 0;
          adjustedEndIndex = this.pageSize - todayCount;
        } else {
          // Auf den folgenden Seiten ignorieren wir die heutigen Events
          adjustedStartIndex = startIndex - todayCount;
          adjustedEndIndex = adjustedStartIndex + this.pageSize;
        }
        return futureEvents.slice(adjustedStartIndex, adjustedEndIndex);
      })
    );
  }

  // Paginierungsänderung verarbeiten
  onPageChange(newPage: number): void {
    this.currentPage = newPage; // Optional: bleibt für Debugging hier
    // this.currentPageSubject.next(newPage); // Synchronisiert den neuen Wert mit currentPage$
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
    'Frühling': { iconType: 'svg', icon: 'spring' },
    'Sommer': { iconType: 'svg', icon: 'summer' },
    'Herbst': { iconType: 'svg', icon: 'autumn' },
    'Winter': { iconType: 'svg', icon: 'winter' },
    'Wintersonnenwende': { iconType: 'font', icon: 'routine' },
    'Sommersonnenwende': { iconType: 'font', icon: 'routine' },
    'Heiligabend': { iconType: 'font', icon: 'featured_seasonal_and_gifts' },
    'Weihnachten': { iconType: 'font', icon: 'featured_seasonal_and_gifts' },
    'Halloween': { iconType: 'svg', icon: 'pumpkin' },
    'Reformationstag': { iconType: 'svg', icon: 'pumpkin' },
    'Ostern': { iconType: 'svg', icon: 'egg' },
    'Valentinsday': { iconType: 'svg', icon: 'valentinsday' },
    'Advent': { iconType: 'svg', icon: 'candle' },
  };

  private readonly iconMapping: Record<string, IconRendererData> = {
    // Diese Mapping-Tabelle enthält alle Kombinationen von Creator (email) und Organizer (email) und das dazugehörige Icon

    [`${environment.PERSON1_EMAIL}_${environment.HOUSEHOLD_CALENDAR_MAIL}`]: { iconType: 'font', icon: 'face_4' },
    [`${environment.PERSON2_EMAIL}_${environment.HOUSEHOLD_CALENDAR_MAIL}`]: { iconType: 'font', icon: 'face_6' },
    [`${environment.PERSON1_EMAIL}_${environment.BIRTHDAY_CALENDAR_MAIL}`]: { iconType: 'svg', icon: 'birthday' },
    [`${environment.HOLIDAY_CALENDAR_MAIL}_${environment.HOLIDAY_CALENDAR_MAIL}`]: { iconType: 'font', icon: 'kid_star' },
    [`${environment.MOON_CALENDAR_MAIL}_${environment.MOON_CALENDAR_MAIL}`]: { iconType: 'font', icon: 'circle' },
    // Weitere Kombinationen hier hinzufügen ...
  }
}
