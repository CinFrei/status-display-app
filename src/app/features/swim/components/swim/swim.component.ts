import { Component } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { StaticHalfCardData, HalfCardComponent } from "../../../../shared/components/half-card/half-card.component";
import { SwimService } from '../../services/swim.service';
import { SwimClubTimes } from '../../interfaces/swim.interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-swim',
  templateUrl: './swim.component.html',
  styleUrls: ['./swim.component.scss'],
  imports: [CommonModule, HalfCardComponent],
})
export class SwimComponent {
  private readonly destroy$ = new Subject<void>();

  // Statische Daten für die Kindkomponente
  statData: StaticHalfCardData = {
    icon: 'tsunami',
    applyStrongTag: false,
  };

  // Rückfalldaten SwimClubTimeData definieren
  private readonly fallbackDataSwimClub: string = 'Läd noch.';
  // Dynamische Daten (Observable)
  swimClubTime$ = new BehaviorSubject<string>(this.fallbackDataSwimClub);
  // Ausstehendes Observable
  obsDataContent2: string = 'Läd noch.';

  constructor(private swimService: SwimService) { }

  ngOnInit(): void {
    this.swimService.getSwimClubTimes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.swimClubTime$.next(data || this.fallbackDataSwimClub),
        error: (err) => {
          console.error('Fehler beim Laden der Wetterdaten:', err);
          this.swimClubTime$.next(this.fallbackDataSwimClub); // Fallback verwenden
        }
      })

  }
}
