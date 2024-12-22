import { Component, Input } from '@angular/core';
import { IconRendererComponent, IconRendererData } from "../icon-renderer/icon-renderer.component";
import { CommonModule } from '@angular/common';

export interface CardData {
  day: string | null;
  date: string;
  title: string;
  time: string | null;
}

@Component({
  selector: 'app-card',
  imports: [IconRendererComponent, CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})

export class CardComponent {    // Inhalt der Karte
  @Input() cardData: CardData = {
    day: 'Heute',
    date: '31. Oktober',
    title: 'Halloweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeen',
    time: '20:15',
  };
  @Input() iconRender: IconRendererData = {
    icon: 'error',
    iconType: 'font'
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('card icon', this.iconRender);

  }
}
