import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherDataProcessingService } from '../../services/weather-data-processing.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IconCircleComponent } from "../../../../shared/components/icon-circle/icon-circle.component";
import { CompactWeatherData, WeatherDescriptionData, CompactData } from '../../interfaces/weather-data-processing.interfaces';

@Component({
  selector: 'app-weather',
  imports: [CommonModule, IconCircleComponent],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherComponent {
  private readonly destroy$ = new Subject<void>();

  // Rückfalldaten definieren
  private readonly fallbackData: CompactWeatherData = {
    temperatur15: -420, // Beispielwert
    wetterCode15: { description: 'No Data', icon: 'close' }, // Beispielwert
    compact: null // Beispielereignis
  };

  // Observable für die Wetterdaten
  compact$ = new BehaviorSubject<CompactWeatherData>(this.fallbackData);


  constructor(private weatherDataService: WeatherDataProcessingService) { }

  ngOnInit() {
    this.weatherDataService
      .processCompactWeather()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.compact$.next(data || this.fallbackData),
        error: (err) => {
          console.error('Fehler beim Laden der Wetterdaten:', err);
          this.compact$.next(this.fallbackData); // Fallback verwenden
        }
      });
    console.log(this.compact$);
  }

  ngOnDestroy() {
    this.destroy$.next(); // Signalisiert das Ende
    this.destroy$.complete(); // Schließt das Subject
  }

}
