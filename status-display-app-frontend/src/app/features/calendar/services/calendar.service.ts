import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
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

  private readonly cardEventSubject = new BehaviorSubject<TransformedEvent[]>([])
  cardEvent$ = this.cardEventSubject.asObservable();

  constructor(
    private http: HttpClient,
    private timersService: TimersService,
  ) {
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

  processCardEvents(): void {
    this.calendarEvents$.pipe(
      map((events) => this.transformToCardData(events)), // Wandle CalendarEvent in TransformedEvent[] um
      tap(data => console.log('processCardEvents', data)),
      catchError((err) => {
        console.error('Fehler bei der Verarbeitung von Events:', err);
        return of([] as TransformedEvent[]);  // Leeres Array korrekt als TransformedEvent[] typisieren
      })
    ).subscribe(data => this.cardEventSubject.next(data)); // Jetzt korrekt getypt
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
