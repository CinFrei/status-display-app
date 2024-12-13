import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TimeService } from '../../../core/services/time.service';
import { SwimClubTimes } from '../interfaces/swim.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SwimService {
  constructor(
    private http: HttpClient,
    private timeService: TimeService,
  ) { }

  getSwimClubTimes(): Observable<string> {
    return this.http.get<SwimClubTimes>('assets/swim-club-times.json').pipe(
      map(data => {
        const currentDay = this.timeService.getCurrentWeekDay(); // Aktuellen Tag abrufen
        return data.swimClubWeek[currentDay] || 'Läd noch.'; // Zeit aus JSON
      }),
      catchError(err => {
        console.error('Fehler beim Abrufen der Daten:', err);
        return of('Läd noch.'); // Fallback-Zeit
      })
    );
  }
}
