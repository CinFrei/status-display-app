import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';
import { CommonModule } from '@angular/common';
import { PaginationButtonComponent } from "../../../../shared/components/pagination-button/pagination-button.component";
import { CardComponent } from "../../../../shared/components/card/card.component";
import { TodaysCardComponent } from "../../../../shared/components/todays-card/todays-card.component";
import { TimeService } from '../../../../core/services/time.service';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, PaginationButtonComponent, CardComponent, TodaysCardComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  constructor(public calendarService: CalendarService, public timeService: TimeService) { }

  ngOnInit(): void {
    // Abonniere die gepipeten Events aus dem Service
  }

  onPageChange(page: number) {
    this.calendarService.onPageChange(page); // Übergibt die Seite an den Service
  }
}
