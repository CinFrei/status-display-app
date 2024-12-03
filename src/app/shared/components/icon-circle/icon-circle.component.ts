import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface DynamicIconCircleData {
  icon: string | null;
  content: string | number | null;
  value: string | number | null;
}
@Component({
  selector: 'app-icon-circle',
  imports: [CommonModule],
  templateUrl: './icon-circle.component.html',
  styleUrl: './icon-circle.component.scss'
})
export class IconCircleComponent {
  // Dynamische Daten
  @Input() icon!: string | null; // Icon (Material-Design-Symbol)
  @Input() content!: string | number | null;
  @Input() value!: string | number | null;
}
