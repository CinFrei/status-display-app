import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CardComponent } from "../../../../shared/components/card/card.component";
import { TransformedEvent } from '../interfaces/calendar.interfaces';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  cardEvent$!: Observable<TransformedEvent[]>; // Kompaktes Event für die Karte

  constructor(private calendarService: CalendarService) { }

  ngOnInit(): void {
    // Initialisiere die Daten
    this.calendarService.initializeCalendarEvents();
    this.calendarService.processCardEvents(); // Kompaktes Event erstellen

    this.cardEvent$ = this.calendarService.cardEvent$;
  }
}
