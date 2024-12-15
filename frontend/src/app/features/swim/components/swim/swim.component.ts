import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { StaticHalfCardData, HalfCardComponent } from "../../../../shared/components/half-card/half-card.component";
import { SwimService } from '../../services/swim.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-swim',
  imports: [CommonModule, HalfCardComponent],
  templateUrl: './swim.component.html',
  styleUrls: ['./swim.component.scss']
})
export class SwimComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Statische Daten für die Kindkomponente
  statData: StaticHalfCardData = {
    icon: 'wave', // Name der SVG-Datei
    iconType: 'svg',
    applyStrongTag: false
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
