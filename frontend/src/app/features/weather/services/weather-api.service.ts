import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, defer, interval, Observable, of, shareReplay, startWith, switchMap, tap, timer } from 'rxjs';
import { TimersService } from '../../../core/services/timers.service';
import { environment } from '../../../../environments/environment';
import { AirQualityForecastAPI, CurrentForecastAPI, HourlyForecastAPI, TenDaysForecastAPI, TodaysForecastAPI } from '../interfaces/weather-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WeatherAPIService {
  private currentSubject = new BehaviorSubject<CurrentForecastAPI | null>(null);
  private hourlySubject = new BehaviorSubject<HourlyForecastAPI | null>(null);
  private todaysSubject = new BehaviorSubject<TodaysForecastAPI | null>(null);
  private tenDaysSubject = new BehaviorSubject<TenDaysForecastAPI | null>(null);
  private airQualitySubject = new BehaviorSubject<AirQualityForecastAPI | null>(null);

  private latitude = `latitude=${environment.latitude}`;
  private longitude = `longitude=${environment.longitude}`;
  private timezone = `timezone=${environment.timezone}`;

  private url = 'https://api.open-meteo.com/';
  private airUrl = 'https://air-quality-api.open-meteo.com/';

  private dwd = 'v1/dwd-icon';

  private buildUrl(
    baseUrl: string,
    endpoint: string,
    standardParams: Record<string, string>, // Standard-Parameter
    dataParams: Record<string, string>, // Datenparameter
    model?: string // Optional
  ): string {
    const standardString = Object.values(standardParams).join('&');
    const dataString = Object.entries(dataParams).map(([key, value]) => `${key}=${value}`).join('&');
    const modelString = model ? `&models=${model}` : ''; // Modell optional hinzufügen
    return `${baseUrl}${endpoint}?${standardString}&${dataString}${modelString}`;
  }

  public callCount = 0;

  // sollten http anfragen lieber nicht im constrictor aufgerufen werden und dafür dann im nuzter? in diesem fall in weather-data-service?
  constructor(
    private http: HttpClient,
    private timersService: TimersService) {
    this.initializeForecastUpdates(
      this.timersService.getQuarterHourTimer(),
      () => this.fetchCurrentForecast(),
      this.currentSubject
    );
    this.initializeForecastUpdates(
      this.timersService.getHourlyTimer(),
      () => this.fetchHourlyForecast(),
      this.hourlySubject
    );
    this.initializeForecastUpdates(
      this.timersService.getDailyTimer(),
      () => this.fetchTodaysForecast(),
      this.todaysSubject
    );
    this.initializeForecastUpdates(
      this.timersService.getDailyTimer(),
      () => this.fetch10DaysForecast(),
      this.tenDaysSubject
    );
    this.initializeForecastUpdates(
      this.timersService.getHourlyTimer(),
      () => this.fetchAirQualityForecast(),
      this.airQualitySubject
    );
  }

  ngOnInit(): void {
    this.timersService.getQuarterHourTimer().subscribe((ms) => {
      console.log('15-Minuten-Timer ausgelöst:', ms);
    });

    this.timersService.getHourlyTimer().subscribe((ms) => {
      console.log('Stündlicher Timer ausgelöst:', ms);
    });

    this.timersService.getDailyTimer().subscribe((ms) => {
      console.log('Täglicher Timer ausgelöst:', ms);
    });
  }

  /**
   * Führt den HTTP-Aufruf für die aktuellen Wetterdaten aus
   * und gibt die Antwort als kaltes Observable zurück
   */

  private initializeForecastUpdates<T>(
    timer$: Observable<number>,
    fetchFn: () => Observable<T>,
    subject: BehaviorSubject<T | null>
  ) {
    timer$
      .pipe(
        startWith(0),
        switchMap(fetchFn),
        catchError(err => {
          console.error('API-Fehler:', err);
          return of(null);
        })
      )
      .subscribe(data => subject.next(data));
  }

  private fetchData<T>(url: string): Observable<T> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<T>(url).pipe(
      // tap(data => console.log(`API Call #${currentCall}:`, data)),
      catchError(err => {
        console.error(`Fehler bei API Call #${currentCall}:`, err);
        return of(null as T);
      })
    );
  }

  //   für den aktuellen Wetter-API - Aufruf(alle 15 Minuten aktuell)
  private fetchCurrentForecast(): Observable<CurrentForecastAPI> {
    const url = this.buildUrl(
      this.url,
      this.dwd,
      { latitude: this.latitude, longitude: this.longitude, timezone: this.timezone },
      {
        minutely_15: 'temperature_2m,weather_code,relative_humidity_2m,precipitation',
        forecast_minutely_15: '1'
      },
      'icon_d2'
    );
    return this.fetchData<CurrentForecastAPI>(url);
  }

  getCurrentForecast(): Observable<CurrentForecastAPI | null> {
    return this.currentSubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // für den stündlichen 12 - Stunden - Wettervorhersage - API - Aufruf
  private fetchHourlyForecast(): Observable<HourlyForecastAPI> {
    const url = this.buildUrl(
      this.url,
      this.dwd,
      { latitude: this.latitude, longitude: this.longitude, timezone: this.timezone },
      {
        hourly: 'relative_humidity_2m,wind_speed_10m,wind_direction_10m,lightning_potential,precipitation,snowfall,rain,showers',
        forecast_hours: '12'
      },
      'icon_d2'
    );
    return this.fetchData<HourlyForecastAPI>(url);
  }

  getHourlyForecast(): Observable<HourlyForecastAPI | null> {
    return this.hourlySubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // für die täglichen, stabileren Wetterdaten(einmal am Tag)
  private fetchTodaysForecast(): Observable<TodaysForecastAPI> {
    const url = this.buildUrl(
      this.url,
      this.dwd,
      { latitude: this.latitude, longitude: this.longitude, timezone: this.timezone },
      {
        daily: 'sunrise,sunset,daylight_duration,sunshine_duration,precipitation_hours,precipitation_probability_max',
        forecast_days: '1'
      },
      'icon_d2'
    );
    return this.fetchData<TodaysForecastAPI>(url);
  }

  getTodaysForecast(): Observable<TodaysForecastAPI | null> {
    return this.todaysSubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // // für den 10 - Tage - Wettervorhersage - API - Aufruf
  private fetch10DaysForecast(): Observable<TenDaysForecastAPI> {
    const url = this.buildUrl(
      this.url,
      this.dwd,
      { latitude: this.latitude, longitude: this.longitude, timezone: this.timezone },
      {
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        forecast_days: '10'
      },
      'icon_d2'
    );
    return this.fetchData<TenDaysForecastAPI>(url);
  }

  get10DaysForecast(): Observable<TenDaysForecastAPI | null> {
    return this.tenDaysSubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // für die stündlich 12 - Stunden - Wettervorhersage der Luftqualitätsdaten - API
  private fetchAirQualityForecast(): Observable<AirQualityForecastAPI> {
    const url = this.buildUrl(
      this.airUrl,
      'v1/air-quality',
      { latitude: this.latitude, longitude: this.longitude, timezone: this.timezone },
      {
        hourly: 'uv_index,uv_index_clear_sky,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
        forecast_hours: '12'
      },

    );
    return this.fetchData<AirQualityForecastAPI>(url);
  }

  getAirQualityForecast(): Observable<AirQualityForecastAPI | null> {
    return this.airQualitySubject.asObservable(); // Liefert ein Observable des Subjects
  }

}
