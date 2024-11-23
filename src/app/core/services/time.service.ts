import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // sorgt dafür, dass der Service global verfügbar ist
})
export class TimeService {
  private timeSubject: BehaviorSubject<string> = new BehaviorSubject(this.getCurrentTime());
  private tenMinSubject: BehaviorSubject<string> = new BehaviorSubject(this.getEvery10Minutes());
  private dateSubject: BehaviorSubject<string> = new BehaviorSubject(this.getCurrentDate());

  private timeInterval: any;
  private tenMinInterval: any;

  constructor() {
    // Setzt einen Interval, um die Zeit alle 10 Minuten zu aktualisieren
    setInterval(() => {
      this.tenMinSubject.next(this.getEvery10Minutes());
    }, 10000); // alle 10 Minuten (10.000 ms)

    // Setzt einen Interval, um die Zeit alle 10 Minuten zu aktualisieren
    setInterval(() => {
      this.timeSubject.next(this.getCurrentTime());
    }, 6000); // jede Minute (6.000 ms)
  }

  ngOnDestroy(): void {
    // Stoppt die Intervalle, wenn der Service zerstört wird
    clearInterval(this.timeInterval);
    clearInterval(this.tenMinInterval);
  }

  // Holt die aktuelle Zeit im Format HH:MM (was ist padstart?)
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
  getCurrentDate(): string {
    const now = new Date();
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const monthName = months[now.getMonth()];
    return `${now.getDate()}. ${monthName} 1${now.getFullYear()}`;
  }

  // Holt den aktuellen Wochentag ausgeschrieben wie "Sonntag"
  getCurrentWeekDay(): string {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const now = new Date();
    return days[now.getDay()];
  }

  getToday(): number {
    const now = new Date();
    return now.getDay();
  }

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
    return this.dateSubject.asObservable();
  }

  // Gibt den aktuellen Wochentag-Stream als Zahl zurück (Observable)
  getToday$() {
    return this.dateSubject.asObservable();
  }
}
