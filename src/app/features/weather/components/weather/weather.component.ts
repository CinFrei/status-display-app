import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherDataProcessingService } from '../../services/weather-data-processing.service';
import { WeatherAPIService } from '../../services/weather-api.service';
import { Subject, takeUntil } from 'rxjs';
import { IconCircleComponent } from "../../../../shared/components/icon-circle/icon-circle.component";

@Component({
  selector: 'app-weather',
  imports: [CommonModule, IconCircleComponent],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherComponent {
  private readonly destroy$ = new Subject<void>();

  currentWeather: any;
  todaysWeather: any;
  forecastWeather: any;

  //icon
  //content

  // //Bsp
  // // Dynamische Daten (Observable)
  // obsDataContent1$: Observable<string | null> = this.swimClubTime$.pipe(
  //   map((time) => time || 'Keine Schwimmzeit verfügbar')
  // );
  // obsDataContent2: string = 'Läd noch.';

  constructor(private weatherDataService: WeatherDataProcessingService, private weatherAPIService: WeatherAPIService) { }

  ngOnInit() {
    this.weatherDataService.processCurrentWeather()
      .pipe(takeUntil(this.destroy$)) // Stoppt die Subscription bei Zerstörung der Komponente
      .subscribe((data) => {
        console.log('Aktuelle Vorhersage:', data);
        this.currentWeather = data;
      });

    this.weatherDataService.processTodaysWeather()
      .pipe(takeUntil(this.destroy$)) // Stoppt die Subscription bei Zerstörung der Komponente
      .subscribe((data) => {
        console.log('Aktuelle Vorhersage:', data);
        this.todaysWeather = data;
      });

    this.weatherDataService.processForecastWeather()
      .pipe(takeUntil(this.destroy$)) // Stoppt die Subscription bei Zerstörung der Komponente
      .subscribe((data) => {
        console.log('Aktuelle Vorhersage:', data);
        this.forecastWeather = data;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(); // Signalisiert das Ende
    this.destroy$.complete(); // Schließt das Subject
  }

}
