import { Component } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  events: any[] = [];

  constructor(private calendarService: CalendarService) { }

  ngOnInit() {
    this.calendarService.getCalendarEvents().subscribe({
      next: (data) => (this.events = data),
      error: (err) => console.error('Fehler beim Abrufen der Daten', err),
    });
  }
}
