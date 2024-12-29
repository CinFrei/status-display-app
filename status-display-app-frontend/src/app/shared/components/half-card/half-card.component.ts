import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconRendererComponent, IconRendererData } from "../icon-renderer/icon-renderer.component";

export interface StaticHalfCardData {
  applyStrongTag: boolean;
}

export interface DynamicHalfCardData {
  content1: string | null;
  content2: string | null;
}

@Component({
  selector: 'app-half-card',
  imports: [CommonModule, IconRendererComponent],
  templateUrl: './half-card.component.html',
  styleUrl: './half-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfCardComponent {
  // Statische Daten
  @Input() statData: StaticHalfCardData = {
    applyStrongTag: true,
  };
  @Input() iconRender: IconRendererData = {
    icon: 'error',
    iconType: 'font'
  }
  // ngOnInit(): void {
  //   //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //   //Add 'implements OnInit' to the class.
  //   console.log('halfcard icon', this.iconRender);

  // }

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
