import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { TimersService } from '../../../core/services/timers.service';
import { CalendarEvent } from '../components/interfaces/calendar.interfaces';
import { TimeService } from '../../../core/services/time.service';
import { CardData } from '../../../shared/components/card/card.component';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private callCount = 0;
  private calendarEventURL = `http://localhost:3000/api/calendar`;

  // Zwischenspeicher für Kalenderdaten
  private calendarEvents$ = new BehaviorSubject<CalendarEvent[]>([]);

  // Observable mit transformierten Daten für die Kartenansicht
  readonly cardData$ = this.calendarEvents$.pipe(
    map(events =>
      events.map(event => this.transformToCardData(event))
    ),
    catchError((err) => {
      console.error('Fehler in cardData$:', err);
      return of([]); // Leere Liste als Fallback
    })
  );

  constructor(private http: HttpClient, private timeService: TimeService, private timersService: TimersService) {
    this.initializeCalendarEvents();
  }

  private initializeCalendarEvents() {
    // Einmal täglich Kalenderdaten aktualisieren
    this.timersService.getDailyTimer()
      .pipe(
        startWith(0), // Erzwingt eine initiale Emission (0 steht für den Initialstart)
        switchMap(() => this.fetchCalendarEvents()), // API-Aufruf
        catchError((err) => {
          console.error('Fehler beim Abrufen der Kalenderdaten:', err);
          return of([]); // Leere Liste als Fallback für Fehler
        })
      )
      .subscribe((data) => {
        this.calendarEvents$.next(data); // Neue Daten zum Zwischenspeichern ins Subject pushen
      });
  }

  // Holt Kalenderdaten von der API
  private fetchCalendarEvents(): Observable<CalendarEvent[]> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<CalendarEvent[]>(this.calendarEventURL).pipe(
      tap(data => console.log(`API Call #${currentCall}:`, data)), // Loggt die API-Calls
    );
  }

  // Gibt das Observable der Kalenderdaten zurück
  getCalendarEvents(): Observable<CalendarEvent[] | null> {
    return this.calendarEvents$.asObservable(); // Liefert ein Observable des Subjects
  }

  // Wandelt ein Kalenderereignis in Kartendaten um
  private transformToCardData(event: CalendarEvent): CardData {
    const startDate = event.start.dateTime || event.start.date || '';
    const date = new Date(startDate);

    return {
      day: this.getDayLabel(date),
      date: this.formatDate(date),
      title: event.summary,
      time: this.formatTime(date),
      icon: 'calendar_today', // Beispiel: Hier könntest du Logik für spezifische Icons einfügen
    };
  }

  private getDayLabel(date: Date): string {
    const today = new Date;
    if (date.toDateString() === today.toDateString()) return 'Heute';
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
    return date.toLocaleDateString('de-DE', { weekday: 'long' });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
}
