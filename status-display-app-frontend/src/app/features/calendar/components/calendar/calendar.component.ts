import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TransformedEvent } from '../interfaces/calendar.interfaces';
import { PaginationButtonComponent } from "../../../../shared/components/pagination-button/pagination-button.component";
import { CardComponent } from "../../../../shared/components/card/card.component";
import { TodaysCardComponent } from "../../../../shared/components/todays-card/todays-card.component";

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, PaginationButtonComponent, CardComponent, TodaysCardComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  public eventsList$!: Observable<TransformedEvent[]>; // Kompaktes Event für die Karte
  public todayEvents$!: Observable<TransformedEvent[]>;

  constructor(public calendarService: CalendarService) { }

  ngOnInit(): void {
    // Abonniere die gepipeten Events aus dem Service
    this.eventsList$ = this.calendarService.paginatedData$; // Auf das paginierte Observable zugreifen
    this.todayEvents$ = this.calendarService.todayEvents$; // Auf das paginierte Observable zugreifen
  }

  onPageChange(page: number) {
    this.calendarService.onPageChange(page); // Übergibt die Seite an den Service
  }
}
