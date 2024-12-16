import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { TimersService } from '../../../core/services/timers.service';
import { CalendarEvent, TransformedEvent } from '../components/interfaces/calendar.interfaces';
import { TimeService } from '../../../core/services/time.service';
import { CardData } from '../../../shared/components/card/card.component';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private callCount = 0;
  private calendarEventURL = `${environment.backendCalendarUrl}`;
  // private calendarEventURL = `http://backend:3000/api/calendar`;

  private calendarEventsSubject$ = new BehaviorSubject<CalendarEvent[]>([]);
  readonly calendarEvents$ = this.calendarEventsSubject$.asObservable();

  private readonly eventsListSubject = new BehaviorSubject<TransformedEvent[]>([])
  eventsList$ = this.eventsListSubject.asObservable();

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
      map((events) => this.transformToCardData(events)), // Wandle CalendarEvent in TransformedEvent[] um
      tap(data => {
        console.log('eventsList', data);
        this.totalItems = data.length; // Gesamtanzahl der bearbeiteten Events setzen
      }),
      catchError((err) => {
        console.error('Fehler bei der Verarbeitung von Events:', err);
        return of([] as TransformedEvent[]);
      })
    ).subscribe(data => {
      this.eventsListSubject.next(data); // Jetzt korrekt getypt
    });
  }

  get paginatedData$(): Observable<TransformedEvent[]> {
    return combineLatest([this.eventsList$, this.currentPage$]).pipe(
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

  // Transformiert Event-Daten in Card-Daten
  private transformToCardData(events: CalendarEvent[]): TransformedEvent[] {
    return events.map(event => {
      const date = new Date(event.start.dateTime || event.start.date || '');
      return {
        day: this.getDayLabel(date),
        date: this.formatDate(date),
        title: event.summary,
        time: this.formatTime(date),
        icon: this.getOrganizerIcon(event.organizer?.displayName || '', event.creator?.email || ''),
      };
    });
  }

  private getDayLabel(date: Date): string {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString();
    return isToday ? 'Heute' : isTomorrow ? 'Morgen' : date.toLocaleDateString('de-DE', { weekday: 'long' });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  private getOrganizerIcon(organizer: string, creator: string): string {
    const icons = environment.organizerIcons[organizer as keyof typeof environment.organizerIcons];
    return icons?.[creator] || 'calendar_today'; // Standardwert, falls keine Zuordnung existiert
  }

}
