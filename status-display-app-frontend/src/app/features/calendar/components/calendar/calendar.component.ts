import { Component } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { CardComponent, CardData } from "../../../../shared/components/card/card.component";

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, CardComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  private readonly destroy$ = new Subject<void>();

  cardData: CardData[] = [];

  constructor(private calendarService: CalendarService) { }

  ngOnInit() {
    this.calendarService.cardData$.subscribe(data => {
      this.cardData = data;
      console.log('Transformed CardData:', data);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(); // Signalisiert das Ende
    this.destroy$.complete(); // Schließt das Subject
  }
}
