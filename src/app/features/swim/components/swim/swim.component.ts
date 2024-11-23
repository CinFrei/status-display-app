import { Component } from '@angular/core';
import { BehaviorSubject, map, Observable, of, Subscription } from 'rxjs';
import { TimeService } from '../../../../core/services/time.service';
import { HalfCardComponent } from "../../../../shared/components/half-card/half-card.component";
import { HalfCardData } from '../../../../shared/components/half-card/half-card.component';
import swimClubData from '../../../../../assets/swim-club-times.json'

@Component({
  selector: 'app-swim',
  imports: [HalfCardComponent],
  templateUrl: './swim.component.html',
  styleUrl: './swim.component.scss',
})
export class SwimComponent {
  private swimClubTimeSubject = new BehaviorSubject<string>('Lade Schwimmzeit...');

  swimClubTime$: Observable<string | null> = this.swimClubTimeSubject.asObservable();

  swimHalfCardData: HalfCardData = {
    icon: 'tsunami',
    contentStrong: '',
    content1: this.swimClubTime$,
    content2: 'Läd noch.',
  };

  constructor(private timeService: TimeService,) { }

  ngOnInit(): void {
    // Holt den Wochentag
    const currentDay$ = this.timeService.getCurrentWeekDay() as keyof typeof swimClubData.swimClubWeek;;

    // Json als Observable
    this.swimClubTimeSubject.next(
      swimClubData.swimClubWeek[currentDay$] || 'Keine Schwimmzeit verfügbar'
    );
  }
}
