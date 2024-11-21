import { Component, Input } from '@angular/core';
import { TimeComponent } from "../../../features/time/components/time/time.component";
import { IconButtonComponent } from "../icon-button/icon-button.component";
import { AkkuComponent } from "../../../features/akku/components/akku/akku.component";
import { RouterModule } from '@angular/router';

interface DetailData {
  contentColumn1: Component;
  contentColumn2: Component;
}

@Component({
  selector: 'app-detail',
  imports: [RouterModule, TimeComponent, IconButtonComponent, AkkuComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {

}
