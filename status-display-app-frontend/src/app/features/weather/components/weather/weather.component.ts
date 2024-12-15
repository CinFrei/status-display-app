import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherDataProcessingService } from '../../services/weather-data-processing.service';
import { Observable, Subject } from 'rxjs';
import { IconCircleComponent } from "../../../../shared/components/icon-circle/icon-circle.component";
import { CompactWeatherData } from '../../interfaces/weather-data-processing.interfaces';

@Component({
  selector: 'app-weather',
  imports: [CommonModule, IconCircleComponent],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent {
  // Observable für die Wetterdaten
  compact$!: Observable<CompactWeatherData | null>;

  constructor(private weatherDataService: WeatherDataProcessingService) { }

  ngOnInit() {
    this.weatherDataService.processCompactWeather();

    this.compact$ = this.weatherDataService.processCompactWeather$;
    console.log('ja wetter komponente', this.compact$)
  }
}
