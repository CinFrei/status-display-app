import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimersService {
  // Timer für Minuten (z. B. 01, 16, 31, 46)
  getQuarterHourTimer(): Observable<number> {
    const now = new Date();
    const msToNextQuarter = this.calculateMsToNextQuarter(now);
    return timer(msToNextQuarter, 15 * 60 * 1000); // Startzeit, dann alle 15 Minuten
  }

  // Timer für Stunden (z. B. 01 jeder Stunde)
  getHourlyTimer(): Observable<number> {
    const now = new Date();
    const msToNextHour = this.calculateMsToNextMinute(now, 1);
    return timer(msToNextHour, 60 * 60 * 1000); // Startzeit, dann jede Stunde
  }

  // Timer für täglich (z. B. 00:01)
  getDailyTimer(): Observable<number> {
    const now = new Date();
    const msToNextDay = this.calculateMsToNextDay(now, 0, 1);
    return timer(msToNextDay, 24 * 60 * 60 * 1000); // Startzeit, dann alle 24 Stunden
  }

  // Hilfsmethoden, um die Startzeiten zu berechnen
  private calculateMsToNextQuarter(date: Date): number {
    const minutes = date.getMinutes();
    const nextQuarter = Math.ceil(minutes / 15) * 15;
    const nextQuarterMs = new Date(date.setMinutes(nextQuarter, 0, 0)).getTime();
    return nextQuarterMs - Date.now();
  }

  private calculateMsToNextMinute(date: Date, minute: number): number {
    const nowMs = Date.now();
    const nextMs = new Date(date.setMinutes(minute, 0, 0)).getTime();
    return nextMs > nowMs ? nextMs - nowMs : nextMs + 60 * 60 * 1000 - nowMs;
  }

  private calculateMsToNextDay(date: Date, hour: number, minute: number): number {
    const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, hour, minute, 0, 0);
    return nextDay.getTime() - Date.now();
  }
}
