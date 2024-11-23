import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface StaticHalfCardData {
  icon: string;
  applyStrongTag: boolean;
}

export interface DynamicHalfCardData {
  content1: Observable<string | null>;
  content2: string;
}

@Component({
  selector: 'app-half-card',
  imports: [CommonModule],
  templateUrl: './half-card.component.html',
  styleUrl: './half-card.component.scss',
})
export class HalfCardComponent {
  // Statische Daten
  @Input() statData: StaticHalfCardData = {
    icon: 'directions_bus',
    applyStrongTag: true,
  };

  // Dynamische Daten
  @Input() obsDataContent1!: Observable<string | null>;
  @Input() obsDataContent2: string = '';
}
