import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

export interface HalfCardData {
  icon: string;
  contentStrong: string;
  content1: Observable<string | null>;
  content2: string;
}

@Component({
  selector: 'app-half-card',
  imports: [AsyncPipe],
  templateUrl: './half-card.component.html',
  styleUrl: './half-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfCardComponent {
  @Input() data: HalfCardData = {
    icon: 'directions_bus',
    contentStrong: '23:55 +6',
    content1: new Observable<'BUS 696 Wallachia Dracula Castle'>,
    content2: '',
  }
}
