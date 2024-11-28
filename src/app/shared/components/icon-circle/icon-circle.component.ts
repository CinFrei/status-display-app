import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

export interface DynamicIconCircleData {
  icon: Observable<string | null>;
  content: Observable<string | null>;
}
@Component({
  selector: 'app-icon-circle',
  imports: [CommonModule],
  templateUrl: './icon-circle.component.html',
  styleUrl: './icon-circle.component.scss'
})
export class IconCircleComponent {
  // Dynamische Daten
  @Input() icon!: Observable<string | null>;
  @Input() content!: Observable<string | null>;
}
