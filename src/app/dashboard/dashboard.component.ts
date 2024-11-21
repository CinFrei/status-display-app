import { Component } from '@angular/core';
import { TimeComponent } from "../features/time/components/time/time.component";

@Component({
  selector: 'app-dashboard',
  imports: [TimeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
