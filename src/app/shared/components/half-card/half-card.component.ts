import { Component, Input } from '@angular/core';

export interface HalfCardData {
  icon: string;
  contentStrong: string;
  content1: string;
  content2: string;
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
    contentStrong: '23:55 +6',
    content1: 'BUS 696 Wallachia Dracula Castle',
    content2: '',
  }
}
