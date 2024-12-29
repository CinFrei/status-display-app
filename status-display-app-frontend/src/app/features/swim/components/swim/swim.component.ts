import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StaticHalfCardData, HalfCardComponent } from "../../../../shared/components/half-card/half-card.component";
import { SwimService } from '../../services/swim.service';
import { CommonModule } from '@angular/common';
import { IconRendererData } from '../../../../shared/components/icon-renderer/icon-renderer.component';

@Component({
  selector: 'app-swim',
  imports: [CommonModule, HalfCardComponent],
  templateUrl: './swim.component.html',
  styleUrls: ['./swim.component.scss']
})
export class SwimComponent implements OnInit {
  // Statische Daten für die Kindkomponente
  statData: StaticHalfCardData = {
    applyStrongTag: false
  };
  iconRender: IconRendererData = {
    icon: 'wave',
    iconType: 'svg'
  };

  // Dynamische Daten direkt aus dem Service (Observable)
  swimClubTime$!: Observable<string>;

  // Fallback für zweite Datenquelle (falls erforderlich)
  obsDataContent2: string = 'Lädt noch.';

  constructor(private swimService: SwimService) { }

  ngOnInit(): void {
    // swimClubTime$ hier initialisieren, um Zugriff vor der Konstruktor-Initialisierung zu vermeiden
    this.swimClubTime$ = this.swimService.swimClubTime$;
  }
}
