import { Component, Input } from '@angular/core';

interface CardData {
  day: string;
  date: string;
  title: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})

export class CardComponent {    // Inhalt der Karte
  @Input() data: CardData = {
    day: 'Heute',
    date: '31. Oktober',
    title: 'Halloweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeen',
    time: '20:15',
    icon: 'calendar_today',
  };
}
