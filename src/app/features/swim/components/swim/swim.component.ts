import { Component } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { TimeService } from '../../../../core/services/time.service';
import { StaticHalfCardData, HalfCardComponent } from "../../../../shared/components/half-card/half-card.component";
import swimClubData from '../../../../../assets/swim-club-times.json';

@Component({
  selector: 'app-swim',
  templateUrl: './swim.component.html',
  styleUrls: ['./swim.component.scss'],
  imports: [HalfCardComponent],
})
export class SwimComponent {
  private swimClubTimeSubject = new BehaviorSubject<string>('Lade Schwimmzeit...');

  swimClubTime$: Observable<string | null> = this.swimClubTimeSubject.asObservable();

  // Statische Daten für die Kindkomponente
  statData: StaticHalfCardData = {
    icon: 'tsunami',
    applyStrongTag: false,
  };

  // Dynamische Daten (Observable)
  obsDataContent1$: Observable<string | null> = this.swimClubTime$.pipe(
    map((time) => time || 'Keine Schwimmzeit verfügbar')
  );

  obsDataContent2: string = 'Läd noch.';

  constructor(private timeService: TimeService) { }

  ngOnInit(): void {
    const currentDay$ = this.timeService.getCurrentWeekDay() as keyof typeof swimClubData.swimClubWeek;
    this.swimClubTimeSubject.next(
      swimClubData.swimClubWeek[currentDay$] || 'Keine Schwimmzeit verfügbar'
    );
  }
}
