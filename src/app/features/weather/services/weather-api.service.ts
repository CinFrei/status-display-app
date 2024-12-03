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
  private latitude = `latitude=${environment.latitude}`;
  private longitude = `longitude=${environment.longitude}`;
  private timezone = `timezone=${environment.timezone}`;

  private url = 'https://api.open-meteo.com/';
  private airUrl = 'https://air-quality-api.open-meteo.com/';
  private dwd = 'v1/dwd-icon';
  private listDaily = 'daily';
  private listHourly = 'hourly';
  private listM15 = 'minutely_15';
  private forecastDays = 'forecast_days';
  private forecastHourly = 'forecast_hours';
  private forecastM15 = 'forecast_minutely_15';

  // https://api.open-meteo.com/v1/dwd-icon?latitude=53.62&longitude=10.13&current=weather_code&timezone=Europe%2FBerlin&forecast_days=1&models=icon_d2

  private currentWeatherUrl = `${this.url}${this.dwd}?${this.latitude}&${this.longitude}&${this.listM15}=temperature_2m,weather_code,relative_humidity_2m,precipitation&${this.timezone}&${this.forecastM15}=1&models=icon_d2`;
  private hourlyForecastWeatherUrl = `${this.url}${this.dwd}?${this.latitude}&${this.longitude}&hourly=relative_humidity_2m,wind_speed_10m,wind_direction_10m,lightning_potential,precipitation,snowfall,rain,showers&${this.timezone}&${this.forecastHourly}=12&models=icon_d2`;
  private todaysWeatherUrl = `${this.url}${this.dwd}?${this.latitude}&${this.longitude}&${this.listDaily}=sunrise,sunset,daylight_duration,sunshine_duration,precipitation_hours,precipitation_probability_max&${this.timezone}&${this.forecastDays}=1&models=icon_d2`;
  private tenDaysForecastWeatherUrl = `${this.url}${this.dwd}?${this.latitude}&${this.longitude}&${this.listDaily}=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&${this.timezone}&${this.forecastDays}=10&models=icon_d2`;
  private airQualityForecastUrl = `${this.airUrl}v1/air-quality?${this.latitude}&${this.longitude}&${this.listHourly}=uv_index,uv_index_clear_sky,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&${this.timezone}&${this.forecastHourly}=12`;

  public callCount = 0;

  constructor(
    private http: HttpClient,
    private timersService: TimersService) {
    this.initializeCurrentWeatherUpdates();
    this.initializeHourlyForecastUpdates();
    this.initializeTodaysWeatherUpdates();
    this.initialize10DaysForecastUpdates();
    this.initializeAirQualityForecastUpdates();
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



  //   für den aktuellen Wetter-API - Aufruf(alle 15 Minuten aktuell)
  private currentSubject = new BehaviorSubject<CurrentForecastAPI | null>(null);

  private initializeCurrentWeatherUpdates() {
    this.timersService.getQuarterHourTimer()
      .pipe(
        startWith(0), // Erzwingt eine initiale Emission (0 steht für den Initialstart)
        switchMap(() => this.fetchCurrentForecast()), // API-Aufruf
        catchError((err) => {
          console.error('Fehler beim Abrufen der heutigen Wetterdaten:', err);
          return of(null); // Fallback für Fehler
        })
      )
      .subscribe((data) => {
        this.currentSubject.next(data); // Neue Daten ins Subject pushen
      });
  }

  private fetchCurrentForecast(): Observable<CurrentForecastAPI> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<CurrentForecastAPI>(this.currentWeatherUrl).pipe(
      tap(data => console.log(`API Call #${currentCall}:`, data)), // Loggt die API-Calls
    );
  }

  getCurrentForecast(): Observable<CurrentForecastAPI | null> {
    return this.currentSubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // für den stündlichen 12 - Stunden - Wettervorhersage - API - Aufruf
  private hourlySubject = new BehaviorSubject<HourlyForecastAPI | null>(null);

  private initializeHourlyForecastUpdates() {
    this.timersService.getHourlyTimer()
      .pipe(
        startWith(0), // Erzwingt eine initiale Emission (0 steht für den Initialstart)
        switchMap(() => this.fetchHourlyForecast()), // API-Aufruf
        catchError((err) => {
          console.error('Fehler beim Abrufen der heutigen Wetterdaten:', err);
          return of(null); // Fallback für Fehler
        })
      )
      .subscribe((data) => {
        this.hourlySubject.next(data); // Neue Daten ins Subject pushen
      });
  }

  private fetchHourlyForecast(): Observable<HourlyForecastAPI> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<HourlyForecastAPI>(this.hourlyForecastWeatherUrl).pipe(
      // tap(data => console.log(`API Call #${currentCall}:`, data)), // Loggt die API-Calls
    );
  }

  getHourlyForecast(): Observable<HourlyForecastAPI | null> {
    return this.hourlySubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // für die täglichen, stabileren Wetterdaten(einmal am Tag)
  private todaysSubject = new BehaviorSubject<TodaysForecastAPI | null>(null);

  private initializeTodaysWeatherUpdates() {
    this.timersService.getDailyTimer()
      .pipe(
        startWith(0), // Erzwingt eine initiale Emission (0 steht für den Initialstart)
        switchMap(() => this.fetchTodaysForecast()), // API-Aufruf
        catchError((err) => {
          console.error('Fehler beim Abrufen der heutigen Wetterdaten:', err);
          return of(null); // Fallback für Fehler
        })
      )
      .subscribe((data) => {
        this.todaysSubject.next(data); // Neue Daten ins Subject pushen
      });
  }

  private fetchTodaysForecast(): Observable<TodaysForecastAPI> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<TodaysForecastAPI>(this.todaysWeatherUrl).pipe(
      // tap(data => console.log(`API Call #${currentCall}:`, data)), // Loggt die API-Calls
    );
  }

  getTodaysForecast(): Observable<TodaysForecastAPI | null> {
    return this.todaysSubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // // für den 10 - Tage - Wettervorhersage - API - Aufruf
  private tenDaysForecastSubject = new BehaviorSubject<TenDaysForecastAPI | null>(null);

  private initialize10DaysForecastUpdates() {
    this.timersService.getDailyTimer()
      .pipe(
        startWith(0), // Erzwingt eine initiale Emission (0 steht für den Initialstart)
        switchMap(() => this.fetch10DaysForecast()), // API-Aufruf
        catchError((err) => {
          console.error('API-Fehler:', err);
          return of(null); // Fallback für Fehler
        })
      )
      .subscribe((data) => {
        this.tenDaysForecastSubject.next(data); // Neue Daten ins Subject pushen
      });
  }

  private fetch10DaysForecast(): Observable<TenDaysForecastAPI> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<TenDaysForecastAPI>(this.tenDaysForecastWeatherUrl).pipe(
      // tap(data => console.log(`API Call #${currentCall}:`, data)), // Loggt die API-Calls
    );
  }

  get10DaysForecast(): Observable<TenDaysForecastAPI | null> {
    return this.tenDaysForecastSubject.asObservable(); // Liefert ein Observable des Subjects
  }


  // für die stündlich 12 - Stunden - Wettervorhersage der Luftqualitätsdaten - API
  private airQualitySubject = new BehaviorSubject<AirQualityForecastAPI | null>(null);

  private initializeAirQualityForecastUpdates() {
    this.timersService.getHourlyTimer()
      .pipe(
        startWith(0), // Erzwingt eine initiale Emission (0 steht für den Initialstart)
        switchMap(() => this.fetchAirQualityForecast()), // API-Aufruf
        catchError((err) => {
          console.error('API-Fehler:', err);
          return of(null); // Fallback für Fehler
        })
      )
      .subscribe((data) => {
        this.airQualitySubject.next(data); // Neue Daten ins Subject pushen
      });
  }

  private fetchAirQualityForecast(): Observable<AirQualityForecastAPI> {
    this.callCount++;
    const currentCall = this.callCount;
    return this.http.get<AirQualityForecastAPI>(this.airQualityForecastUrl).pipe(
      // tap(data => console.log(`API Call #${currentCall}:`, data)), // Loggt die API-Calls
    );
  }

  getAirQualityForecast(): Observable<AirQualityForecastAPI | null> {
    return this.airQualitySubject.asObservable(); // Liefert ein Observable des Subjects
  }

}
