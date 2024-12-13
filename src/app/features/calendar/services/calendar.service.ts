import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = 'http://localhost:3000/api/calendar'; // Backend-URL

  constructor(private http: HttpClient) { }

  getCalendarEvents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
