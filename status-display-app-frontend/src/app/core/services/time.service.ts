import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, map, startWith, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root', // sorgt dafür, dass der Service global verfügbar ist
})
export class TimeService {
  private timeSubject = new BehaviorSubject(this.getCurrentTime());
  private tenMinSubject = new BehaviorSubject(this.getEvery10Minutes());
  private dateSubject = new BehaviorSubject(this.getCurrentDate());
  private weekDaySubject = new BehaviorSubject(this.getCurrentWeekDay());

  private timeInterval$ = interval(6000).pipe(
    startWith(0), // Start sofort mit einem Wert
    map(() => this.getCurrentTime()) // Aktualisiere die Zeit jede Minute
  );

  private tenMinInterval$ = interval(60000).pipe(
    startWith(0), // Start sofort
    map(() => this.getEvery10Minutes()) // Aktualisiere alle 10 Minuten
  );

  private subscriptions = [
    this.timeInterval$.subscribe(this.timeSubject),
    this.tenMinInterval$.subscribe(this.tenMinSubject)
  ];

  constructor() { }

  ngOnDestroy(): void {
    // Beende die Subscriptions, wenn der Service zerstört wird
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Holt die aktuelle Zeit im Format HH:MM
  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Holt die aktuelle Zeit im Format HH:MM (runden auf den nächsten 10-Minuten-Takt)
  getEvery10Minutes(): string {
    const now = new Date();
    const minutes = Math.floor(now.getMinutes() / 10) * 10; // Runden auf den nächsten 10-Minuten-Takt
    return `${now.getHours()}:${minutes < 10 ? '0' + minutes : minutes}`;
  }

  // Holt das aktuelle Datum im Format TT. Month 1YYYY
  // (Human Era Calendar add 10.000 years to Gregorian Calendar, kurzgesagt in a nutshell)
  getCurrentDateHE(): string {
    const now = new Date();
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const monthName = months[now.getMonth()];
    return `${now.getDate()}. ${monthName} ${now.getFullYear() + 10000}`; // Human Era
  }

  // Holt das aktuelle Datum im Format TT. Month YYYY
  getCurrentDate(): string {
    const now = new Date();
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const monthName = months[now.getMonth()];
    return `${now.getDate()}. ${monthName} ${now.getFullYear()}`;
  }

  // Holt das aktuelle Datum im Format TT. Month YYYY
  getCurrentDay(): string {
    const now = new Date();
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const monthName = months[now.getMonth()];
    return `${now.getDate()}. ${monthName}`;
  }

  // Holt den aktuellen Wochentag ausgeschrieben wie "Sonntag"
  getCurrentWeekDay(): string {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const now = new Date();
    return days[now.getDay()];
  }

  // Public Observable-Methoden

  // Gibt den aktuellen Uhrzeit-Stream zurück (Observable)
  getTime$() {
    return this.timeSubject.asObservable();
  }

  // Gibt den aktuellen Uhrzeit-Stream zurück (Observable)
  getTenMinutes$() {
    return this.tenMinSubject.asObservable();
  }

  // Gibt den aktuellen Datum-Stream zurück (Observable)
  getDate$() {
    return this.dateSubject.asObservable();
  }

  // Gibt den aktuellen Wochentag-Stream ausgeschrieben zurück (Observable)
  getCurrendWeekDay$() {
    return this.weekDaySubject.asObservable();
  }

}
