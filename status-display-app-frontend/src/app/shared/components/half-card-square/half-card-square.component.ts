import { Component, Input } from '@angular/core';

export interface HalfCardSquareData {
  icon: string;
  icon2: string;
}
@Component({
  selector: 'app-half-card-square',
  imports: [],
  templateUrl: './half-card-square.component.html',
  styleUrl: './half-card-square.component.scss'
})
export class HalfCardSquareComponent {
  @Input() data: HalfCardSquareData = {
    icon: 'exercise',
    icon2: 'receipt_long',
  }
}
