import { Injectable } from '@angular/core';
import { WeatherAPIService } from './weather-api.service';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of } from 'rxjs';
import { AirQualityData, CompactData, CompactWeatherData, CurrentWeatherData, ForecastWeatherData, HourlyForecastData, TodaysWeatherData, WeatherDescriptionData } from '../interfaces/weather-data-processing.interfaces';
import { AirQualityForecastAPI, CurrentForecastAPI, HourlyForecastAPI } from '../interfaces/weather-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WeatherDataProcessingService {
  private readonly compactSubject = new BehaviorSubject<CompactWeatherData | null>({
    temperatur15: -420,
    wetterCode15: { description: 'No Data', icon: 'close' },
    compact: []
  });
  processCompactWeather$ = this.compactSubject.asObservable();


  constructor(private weatherAPIService: WeatherAPIService) { }

  /**
 * Generische Methode zur Verarbeitung von Wetterdaten.
 * Führt eine Nullprüfung durch und transformiert die Daten nur, wenn sie existieren.
 * @param rawData Die rohen JSON-Daten.
 * @param mapper Eine Funktion, die Rohdaten in das gewünschte Format transformiert.
 * @returns Die transformierten Daten oder null, falls ein Fehler auftritt oder die Daten fehlen.
 */
  private processUniversal<T, U>(rawData: T | null, mapper: (data: T) => U): U | null {
    if (!rawData) {
      console.warn('Rohdaten fehlen oder sind null. Verarbeitung wird übersprungen.');
      return null;
    }
    try {
      return mapper(rawData);
    } catch (error) {
      console.error('Fehler beim Verarbeiten der Daten:', error);
      return null;
    }
  }

  private mapCompactWeather(
    current: CurrentForecastAPI | null,
    hourly: HourlyForecastAPI | null,
    air: AirQualityForecastAPI | null
  ): CompactWeatherData | null {
    if (!current || !hourly || !air) {
      return null;
    }

    const compact = [
      this.getNextEvent(hourly.hourly.precipitation, 0, 'beach_access'), // Regen
      this.getNextEvent(hourly.hourly.snowfall, 0, 'ac_unit'), // Schnee
      this.getNextEvent(hourly.hourly.lightning_potential, 0, 'thunderstorm'), // Gewitter
      this.getNextEvent(air.hourly.uv_index_clear_sky, 25, 'sanitizer'), // UV-Index
      this.getEarliestPollenEvent([
        air.hourly.alder_pollen,
        air.hourly.birch_pollen,
        air.hourly.grass_pollen,
        air.hourly.mugwort_pollen,
        air.hourly.olive_pollen,
        air.hourly.ragweed_pollen,
      ]), // Pollen
    ].filter((event): event is CompactData => event !== null);

    const temperatur15 = this.getRoundedTemperatur(current.minutely_15.temperature_2m[0]);
    const wetterCode15 = this.getWeatherDescription(current.minutely_15.weather_code[0]);

    return { temperatur15, wetterCode15, compact };
  }

  processCompactWeather(): void {
    combineLatest([
      this.weatherAPIService.getCurrentForecast(),
      this.weatherAPIService.getHourlyForecast(),
      this.weatherAPIService.getAirQualityForecast(),
    ]).pipe(
      map(([current, hourly, air]) => this.mapCompactWeather(current, hourly, air)),
      catchError((err) => {
        console.error('Fehler bei der Verarbeitung von Kompakten Wetterdaten:', err);
        return of(null);
      })
    ).subscribe({
      next: (compact) => this.compactSubject.next(compact),
      error: (err) => {
        console.error('Fehler beim Aktualisieren der SwimClubTimes:', err);
      }
    });
  }

  private mapCurrentWeather(data: any): CurrentWeatherData {
    return {
      // Werte für 15-Minuten-Intervall
      niederschlag15: data.minutely_15.precipitation[0],
      luftfeuchtigkeit15: data.minutely_15.relative_humidity_2m[0],
      temperatur: data.minutely_15.temperature_2m[0],
      zeitStempel15: data.minutely_15.time[0],
      wetterCode15: this.getWeatherDescription(data.minutely_15.weather_code[0]),
    };
  }

  processCurrentWeather(): Observable<CurrentWeatherData | null> {
    return this.weatherAPIService.getCurrentForecast().pipe(
      map((data) => this.processUniversal(data, this.mapCurrentWeather)),
      catchError((err) => {
        console.error('Fehler beim Verarbeiten der aktuellen Wetterdaten:', err);
        return of(null);
      })
    );
  }

  private mapHourlyForecast(data: any): HourlyForecastData {
    return {
      // Stündliche Vorhersage
      blitzPotenzial: data.hourly.lightning_potential,
      niederschlagH: data.hourly.precipitation,
      regenH: data.hourly.rain,
      schauerH: data.hourly.showers,
      schneeH: data.hourly.snowfall,
      zeitStempelH: data.hourly.time,
      windRichtung: data.hourly.wind_direction_10m,
      windGeschw: data.hourly.wind_speed_10m,
    };
  }

  processHourlyWeather(): Observable<HourlyForecastData | null> {
    return this.weatherAPIService.getHourlyForecast().pipe(
      map((data) => this.processUniversal(data, this.mapHourlyForecast)),
      catchError((err) => {
        console.error('Fehler beim stündlichen Wetter:', err);
        return of(null);
      })
    );
  }

  private mapAirQuality(data: any): AirQualityData {
    return {
      // Luftqualität
      erlenPollen: data.hourly.alder_pollen,
      birkenPollen: data.hourly.birch_pollen,
      graeserPollen: data.hourly.grass_pollen,
      beifussPollen: data.hourly.mugwort_pollen,
      olivenPollen: data.hourly.olive_pollen,
      ambrosiaPollen: data.hourly.ragweed_pollen,
      UVIndex: data.hourly.uv_index,
      UVIndexKlarerHimmel: data.hourly.uv_index_clear_sky,
      zeitStempelLuft: data.hourly.time,
    };
  }

  processAirQuality(): Observable<AirQualityData | null> {
    return this.weatherAPIService.getAirQualityForecast().pipe(
      map((data) => this.processUniversal(data, this.mapAirQuality)),
      catchError((err) => {
        console.error('Fehler beim Verarbeiten der Air Daten:', err);
        return of(null);
      })
    );
  }

  private mapTodaysWeather(data: any): TodaysWeatherData {
    return {
      // Tagesdaten
      tageslängenDauer: data.daily.daylight_duration[0], // "s"
      niederschlagsStunden: data.daily.precipitation_hours[0], // "h"
      niederschlagsWahrscheinlichkeitMaxD: data.daily.precipitation_probability_max[0], // "%"
      sonnenaufgang: data.daily.sunrise[0], //'YYYY-MM-DDTHH:MM'
      sonnenuntergang: data.daily.sunset[0], //'YYYY-MM-DDTHH:MM'
      sonnenscheinDauer: data.daily.sunshine_duration[0], // "s"
      zeitStempelD: data.daily.time[0], //'YYYY-MM-DD'
    };
  }

  processTodaysWeather(): Observable<TodaysWeatherData | null> {
    return this.weatherAPIService.getTodaysForecast().pipe(
      map((data) => this.processUniversal(data, this.mapTodaysWeather)),
      catchError((err) => {
        console.error('Fehler beim Verarbeiten der täglichen Wetterdaten:', err);
        return of(null);
      })
    );
  }

  private mapForecastWeather(data: any): ForecastWeatherData {
    return {
      // 10 Tage Vorhersage
      niederschlagsWahrscheinlichkeitMaxF: data.daily.precipitation_probability_max[0], // Max. Niederschlagswahrscheinlichkeit
      temperaturMaxF: data.daily.temperature_2m_max[0], // Max. Temperatur in °C
      temperaturMinF: data.daily.temperature_2m_min[0], // Min. Temperatur in °C
      zeitStempelF: data.daily.time[0], // Datum im ISO-Format
      wetterCodeF: data.daily.weather_code[0], // Wetterbeschreibung oder WMO Code
    };
  }

  processForecastWeather(): Observable<ForecastWeatherData | null> {
    return this.weatherAPIService.get10DaysForecast().pipe(
      map((data) => this.processUniversal(data, this.mapForecastWeather)),
      catchError((err) => {
        console.error('Fehler beim Verarbeiten des täglichen 10 Days Forecast:', err);
        return of(null);
      })
    );
  }

  /**
  * Hilfsmethoden
  */

  private getRoundedTemperatur(value: number): number {
    return Math.round(value);
  }

  private getEarliestPollenEvent(pollenArrays: number[][]): CompactData | null {
    const events = pollenArrays
      .map((array) => this.getNextEvent(array, 50, 'allergy'))
      .filter((event): event is { icon: string; value: string } => event !== null);
    if (events.length === 0) return null;
    // Finde das Event mit der kleinsten Stunde
    return events.reduce((earliest, current) => {
      const earliestHour = parseInt(earliest.value.replace("h", ""));
      const currentHour = parseInt(current.value.replace("h", ""));
      return currentHour < earliestHour ? current : earliest;
    });
  }

  private getNextEvent(values: number[], biggerThen: number, icon: string
  ): CompactData | null {
    // Beispiel: Suche den ersten relevanten Wert (z. B. größer als 0)
    const index = values.findIndex((wert) => wert > biggerThen);
    if (index !== -1) {
      return { icon, value: `${index + 1}h` };
    }
    return null;
  }

  private getWeatherDescription(weatherCode: number): WeatherDescriptionData {
    // Hier könnte eine tatsächliche Mapping-Logik stehen
    const weatherDescriptions: { [key: number]: { description: string, icon: string } } = {
      0: { description: 'Klarer Himmel', icon: 'clear_day' },
      1: { description: 'Meistens klar', icon: 'partly_cloudy_day' },
      2: { description: 'Teilweise bewölkt', icon: 'partly_cloudy_day' },
      3: { description: 'Bewölkt', icon: 'filter_drama' },
      45: { description: 'Nebel', icon: 'foggy' },
      48: { description: 'Reifennebel', icon: 'foggy' },
      51: { description: 'Leichter Nieselregen', icon: 'rainy' },
      53: { description: 'Mäßiger Nieselregen', icon: 'rainy' },
      55: { description: 'Dichter Nieselregen', icon: 'rainy' },
      56: { description: 'Leichter gefrierender Nieselregen', icon: 'weather_mix' },
      57: { description: 'Dichter gefrierender Nieselregen', icon: 'weather_mix' },
      61: { description: 'Leichter Regen', icon: 'rainy' },
      63: { description: 'Mäßiger Regen', icon: 'rainy' },
      65: { description: 'Starker Regen', icon: 'rainy' },
      66: { description: 'Leichter gefrierender Regen', icon: 'weather_mix' },
      67: { description: 'Starker gefrierender Regen', icon: 'weather_mix' },
      71: { description: 'Leichter Schneefall', icon: 'weather_snowy' },
      73: { description: 'Mäßiger Schneefall', icon: 'weather_snowy' },
      75: { description: 'Starker Schneefall', icon: 'weather_snowy' },
      77: { description: 'Schneekörner', icon: 'weather_snowy' },
      80: { description: 'Leichte Regenschauer', icon: 'rainy_light' },
      81: { description: 'Mäßige Regenschauer', icon: 'rainy_light' },
      82: { description: 'Heftige Regenschauer', icon: 'rainy_heavy' },
      85: { description: 'Leichte Schneeschauer', icon: 'snowing' },
      86: { description: 'Starke Schneeschauer', icon: 'snowing_heavy' },
      95: { description: 'Leichter Gewitterregen', icon: 'thunderstorm' },
      96: { description: 'Mäßiger Gewitterregen', icon: 'thunderstorm' },
      99: { description: 'Starkes Gewitter mit Hagel', icon: 'weather_hail' },
    };
    return weatherDescriptions[weatherCode] || 'routine';
  }
}
