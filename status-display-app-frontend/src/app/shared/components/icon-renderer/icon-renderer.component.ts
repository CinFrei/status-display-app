import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface IconRendererData {
  icon: string;
  iconType: 'svg' | 'font';
}

@Component({
  selector: 'app-icon-renderer',
  imports: [CommonModule],
  templateUrl: './icon-renderer.component.html',
  styleUrl: './icon-renderer.component.scss'
})
export class IconRendererComponent {
  @Input() iconRender: IconRendererData = {
    icon: 'error',
    iconType: 'font',
  };  // Der Input sollte als IconOrSvg definiert sein
  @Input() defaultSvgClass: string = 'default-svg-icon'; // Standardklasse für SVG
  @Input() defaultFontClass: string = 'default-font-icon'; // Standardklasse für Font
  @Input() sizeClass: string = 'big-icon'; // Standardgröße (kann überschrieben werden)
}
