import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { TimeService } from '../../../core/services/time.service';
import { SwimClubTimes } from '../interfaces/swim.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SwimService {
  private swimClubTimeSubject = new BehaviorSubject<string>('Läd noch.');
  swimClubTime$ = this.swimClubTimeSubject.asObservable();

  constructor(
    private http: HttpClient,
    private timeService: TimeService,
  ) {
    this.loadSwimClubTimes(); // Initialer Datenabruf
  }

  // HTTP-Daten abrufen und ins BehaviorSubject laden
  private loadSwimClubTimes(): void {
    this.http.get<SwimClubTimes>('assets/swim-club-times.json').pipe(
      map(data => {
        const currentDay = this.timeService.getCurrentWeekDay(); // Aktuellen Tag abrufen
        return data.swimClubWeek[currentDay] || 'Läd noch.'; // Zeit aus JSON
      }),
      catchError(err => {
        console.error('Fehler beim Abrufen der Daten:', err);
        return of('Läd noch.'); // Fallback-Zeit
      })
    ).subscribe({
      next: (time) => this.swimClubTimeSubject.next(time), // Daten ins Subject schreiben
      error: (err) => {
        console.error('Fehler beim Aktualisieren der SwimClubTimes:', err);
      }
    });
  }
}
