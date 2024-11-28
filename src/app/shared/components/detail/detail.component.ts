import { Component, Input } from '@angular/core';
import { TimeComponent } from "../../../features/time/components/time/time.component";
import { AkkuComponent } from "../../../features/akku/components/akku/akku.component";
import { RouterModule } from '@angular/router';
import { IconCircleComponent } from '../icon-circle/icon-circle.component';

export interface DetailData {
  contentColumn1: Component;
  contentColumn2: Component;
}

@Component({
  selector: 'app-detail',
  imports: [RouterModule, IconCircleComponent, TimeComponent, AkkuComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  // @Input() data: DetailData={
  // contentColumn1:,
  // contentColumn2:,
  // }
}
