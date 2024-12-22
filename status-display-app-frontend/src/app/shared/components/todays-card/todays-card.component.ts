import { Component, Input } from '@angular/core';
import { IconRendererData, IconRendererComponent } from '../icon-renderer/icon-renderer.component';

export interface TodaysCardData {
  day: string,
  date: string,
  title: string,
  time: string,
}
@Component({
  selector: 'app-todays-card',
  imports: [IconRendererComponent],
  templateUrl: './todays-card.component.html',
  styleUrl: './todays-card.component.scss'
})
export class TodaysCardComponent {
  @Input() todaysCardData: TodaysCardData = {
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
