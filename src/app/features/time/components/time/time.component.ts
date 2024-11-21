import { Component } from '@angular/core';
import { TimeService } from '../../../../core/services/time.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-time',
  imports: [],
  templateUrl: './time.component.html',
  styleUrl: './time.component.scss'
})
export class TimeComponent {
  //Vars
  currentTime: string = '';
  currentTenMinTime: string = '';
  currentDate: string = '';
  private subscriptions: Subscription[] = [];


  constructor(private timeService: TimeService) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // Abonniere die Streams
    this.timeService.getTime$().subscribe((time) => {
      this.currentTime = time;
    });

    this.timeService.getTenMinutes$().subscribe((tenMin) => {
      this.currentTenMinTime = tenMin;
    });

    this.timeService.getDate$().subscribe((date) => {
      this.currentDate = date;
    });
  }

  ngOnDestroy(): void {
    // Kündige alle Subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
