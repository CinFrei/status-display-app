import { Component, Input } from '@angular/core';
import { IconRendererData } from '../icon-renderer/icon-renderer.component';
import { CommonModule } from '@angular/common';
import { CardComponent } from "../card/card.component";
import { TransformedEvent } from '../../../features/calendar/components/interfaces/calendar.interfaces';

@Component({
  selector: 'app-todays-card',
  imports: [CommonModule, CardComponent],
  templateUrl: './todays-card.component.html',
  styleUrl: './todays-card.component.scss'
})
export class TodaysCardComponent {
  @Input() todaysCardData: TransformedEvent[] = []
}
