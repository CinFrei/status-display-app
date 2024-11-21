import { Component, Input } from '@angular/core';

interface HalfCardData {
  icon: string;
  time: string;
  delay: number;
  vehicle: string;
  direction: string;
}
@Component({
  selector: 'app-half-card',
  imports: [],
  templateUrl: './half-card.component.html',
  styleUrl: './half-card.component.scss'
})
export class HalfCardComponent {
  @Input() data: HalfCardData = {
    icon: 'directions_bus',
    time: '23:55',
    delay: 6,
    vehicle: 'BUS 696',
    direction: 'Wallachia Dracula Castle',
  }
}
