import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface StaticHalfCardData {
  icon: string;
  applyStrongTag: boolean;
}

export interface DynamicHalfCardData {
  content1: string | null;
  content2: string | null;
}

@Component({
  selector: 'app-half-card',
  imports: [CommonModule],
  templateUrl: './half-card.component.html',
  styleUrl: './half-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfCardComponent {
  // Statische Daten
  @Input() statData: StaticHalfCardData = {
    icon: 'directions_bus',
    applyStrongTag: true,
  };

  // Dynamische Daten
  @Input() obsDataContent1!: string | null;
  @Input() obsDataContent2!: string | null;

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log('ngOnChanges detected', changes);
  // }

  // ngDoCheck(): void {
  //   console.log('Change Detection wurde ausgelöst SWIMM.');
  // }
}
