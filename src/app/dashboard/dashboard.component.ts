import { Component } from '@angular/core';
import { TimeComponent } from "../features/time/components/time/time.component";
import { SwimComponent } from "../features/swim/components/swim/swim.component";
import { WeatherComponent } from "../features/weather/components/weather/weather.component";
import { IconCircleComponent } from "../shared/components/icon-circle/icon-circle.component";
import { CardComponent } from "../shared/components/card/card.component";
import { CalendarComponent } from "../features/calendar/components/calendar/calendar.component";

@Component({
  selector: 'app-dashboard',
  imports: [TimeComponent, SwimComponent, WeatherComponent, IconCircleComponent, CardComponent, CalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
