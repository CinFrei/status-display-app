import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CardComponent } from "../../../../shared/components/card/card.component";
import { TransformedEvent } from '../interfaces/calendar.interfaces';
import { PaginationButtonComponent } from "../../../../shared/components/pagination-button/pagination-button.component";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CardComponent, PaginationButtonComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  public eventsList$!: Observable<TransformedEvent[]>; // Kompaktes Event für die Karte

  constructor(public calendarService: CalendarService) { }

  ngOnInit(): void {
    // Abonniere die gepipeten Events aus dem Service
    this.eventsList$ = this.calendarService.paginatedData$; // Auf das paginierte Observable zugreifen
  }

  onPageChange(page: number) {
    this.calendarService.onPageChange(page); // Übergibt die Seite an den Service
  }
}
