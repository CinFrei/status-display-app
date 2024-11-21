import { Component, Input } from '@angular/core';

interface IconButtonData {
  icon: string;
}
@Component({
  selector: 'app-icon-button',
  imports: [],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
  @Input() data: IconButtonData = {
    icon: 'nights_stay',
  }
}
