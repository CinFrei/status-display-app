import { Component } from '@angular/core';
import { SwimService } from '../../services/swim.service';
import { Subscription } from 'rxjs';
import { TimeService } from '../../../../core/services/time.service';
import { HalfCardComponent } from "../../../../shared/components/half-card/half-card.component";
import { HalfCardData } from '../../../../shared/components/half-card/half-card.component';

@Component({
  selector: 'app-swim',
  imports: [HalfCardComponent],
  templateUrl: './swim.component.html',
  styleUrl: './swim.component.scss',
})
export class SwimComponent {
  //Vars
  public swimClubTime: string = ''; // Hier speichern wir die Schwimmzeit
  private subscriptions: Subscription[] = [];

  swimHalfCardData: HalfCardData = {
    icon: 'tsunami',
    contentStrong: '',
    content1: this.swimClubTime,
    content2: 'blub',
  };

  constructor(
    private swimService: SwimService,
    private timeService: TimeService,
  ) { }

  ngOnInit(): void {
    const weekDay = this.timeService.getCurrentWeekDay(); // Holt den Wochentag
    // Hole die Schwimmclub-Zeiten und zeige sie für den aktuellen Tag
    this.swimService.getSwimClubTimes().subscribe((jData) => {
      // Hole die Zeit für den aktuellen Tag
      const newSwimTime = jData['swim-club-week'][weekDay];
      if (this.swimClubTime !== newSwimTime) {
        this.swimClubTime = newSwimTime; // Nur wenn sich die Zeit geändert hat
        this.swimHalfCardData.content1 = newSwimTime; // Update nur dann, wenn notwendig
      }
    });
  }

  ngOnDestroy(): void {
    // Kündige alle Subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
