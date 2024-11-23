import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SwimClubTimes {
  swimClubWeek: {
    [key: string]: string; // Schlüssel sind Wochentage, Werte die Zeiten
  };
}

@Injectable({
  providedIn: 'root'
})
export class SwimService {
  constructor(
    private http: HttpClient,
  ) { }

  getSwimClubTimes(): Observable<SwimClubTimes> {
    return this.http.get<SwimClubTimes>('assets/swim-club-times.json').pipe(
      catchError(err => {
        console.error('Fehler beim Abrufen der Daten:', err);
        return of({ swimClubWeek: {} }); // Rückgabe eines Fallback-Werts
      })
    );
  }
}
