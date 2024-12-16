import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { TimersService } from '../../../core/services/timers.service';
import { CalendarEvent } from '../components/interfaces/calendar.interfaces';
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

  private calendarEventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  readonly calendarEvents$ = this.calendarEventsSubject.asObservable();
  readonly cardData$ = this.calendarEvents$.pipe(
    map(events => events.map(event => this.transformToCardData(event))),
    catchError(err => {
      console.error('Fehler in cardData$:', err);
      return of([]); // Fallback
    })
  );

  constructor(
    private http: HttpClient,
    private timersService: TimersService,
    private timeService: TimeService
  ) {
    this.setupDailyUpdates();
  }

  // Setzt tägliche Updates auf
  private setupDailyUpdates(): void {
    this.timersService.getDailyTimer().pipe(
      startWith(0), // Initialer Start
      switchMap(() => this.fetchCalendarEvents()), // API-Daten abrufen
      catchError(err => {
        console.error('Fehler beim Abrufen der Kalenderdaten:', err);
        return of([]); // Leere Liste als Fallback
      })
    ).subscribe(events => this.calendarEventsSubject.next(events));
  }

  // API-Daten abrufen
  private fetchCalendarEvents(): Observable<CalendarEvent[]> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<CalendarEvent[]>(this.calendarEventURL).pipe(
      tap(events => console.log(`API Call #${currentCall}:`, events))
    );
  }

  // Transformiert Event-Daten in Card-Daten
  private transformToCardData(event: CalendarEvent): CardData {
    const date = new Date(event.start.dateTime || event.start.date || '');
    return {
      day: this.getDayLabel(date),
      date: this.formatDate(date),
      title: event.summary,
      time: this.formatTime(date),
      icon: this.getOrganizerIcon(event.organizer.displayName, event.creator.email),
    };
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
    const icons: { [key: string]: { [key: string]: string } } = {
      'Feiertage in Deutschland': { 'de.german#holiday@group.v.calendar.google.com': 'star' },
      'Phases of the Moon': { 'ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com': 'dark_mode' },
      'Dandys Haushalt': { 'cindy.freiberg@gmail.com': 'face_4', 'd.froebel@gmail.com': 'face_6' },
      'Geburtstage': { 'cindy.freiberg@gmail.com': 'cake' },
    };
    return icons[organizer]?.[creator] || 'calendar_today';
  }

}
