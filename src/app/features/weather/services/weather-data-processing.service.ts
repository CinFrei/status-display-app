import { Injectable } from '@angular/core';
import { WeatherAPIService } from './weather-api.service';
import { BehaviorSubject, catchError, combineLatest, forkJoin, map, mergeMap, Observable, of, tap } from 'rxjs';
import { AirQualityData, CompactData, CurrentWeatherData, ForecastWeatherData, HourlyForecastData, TodaysWeatherData, WeatherDescriptionData } from '../interfaces/weather-data-processing.interfaces';



@Injectable({
  providedIn: 'root'
})
export class WeatherDataProcessingService {
  constructor(private weatherAPIService: WeatherAPIService) { }

  processCompactWeather(): Observable<any | null> {
    return combineLatest([
      this.weatherAPIService.getCurrentForecast(),
      this.weatherAPIService.getHourlyForecast(),
      this.weatherAPIService.getAirQualityForecast(),
    ]).pipe(
      map(([current, hourly, air]) => {
        // Kompakte Daten erstellen
        console.log('processcompact api call', current, hourly, air);
        if (current && hourly && air) {
          const compact = [
            this.getNextEvent(hourly.hourly.precipitation, 0, 'umbrella'), // Regen
            this.getNextEvent(hourly.hourly.snowfall, 0, 'ac_unit'), // Schnee
            this.getNextEvent(hourly.hourly.lightning_potential, 0, 'thunderstorm'), // Gewitter
            this.getNextEvent(air.hourly.uv_index_clear_sky, 25, 'sanitizer'), // Gewitter
            this.getEarliestPollenEvent([
              air.hourly.alder_pollen,
              air.hourly.birch_pollen,
              air.hourly.grass_pollen,
              air.hourly.mugwort_pollen,
              air.hourly.olive_pollen,
              air.hourly.ragweed_pollen,
            ]), // Pollen
          ].filter((event): event is { icon: string; value: string } => event !== null);
          // Daten aus `current` extrahieren
          const temperatur15 = this.getRoundedTemperatur(current.minutely_15.temperature_2m[0]);
          const wetterCode15 = this.getWeatherDescription(current.minutely_15.weather_code[0]);
          console.log('processcompact ergebnis', { temperatur15, wetterCode15, compact })
          return { temperatur15, wetterCode15, compact };
        } else {
          return null;
        }
      }),
      catchError(err => {
        console.error('Fehler bei der Verarbeitung von Kompakten Wetterdaten:', err);
        return of(null); // Sinnvolle Default-Werte zurückgeben
      })
    );
  }

  processCurrentWeather(): Observable<CurrentWeatherData | null> {
    return this.weatherAPIService.getCurrentForecast().pipe(
      map((currentWeather) => {
        if (currentWeather) {
          // Hier kommen die Logik und die Datenverarbeitung
          // console.log('Aktuelles Wetter:', currentWeather);
          return {
            // Werte für 15-Minuten-Intervall
            niederschlag15: currentWeather.minutely_15.precipitation[0],
            luftfeuchtigkeit15: currentWeather.minutely_15.relative_humidity_2m[0],
            temperatur: currentWeather.minutely_15.temperature_2m[0],
            zeitStempel15: currentWeather.minutely_15.time[0],
            wetterCode15: this.getWeatherDescription(currentWeather.minutely_15.weather_code[0]),

          };
        }
        return null; // Falls Daten fehlen
      }),
      catchError(err => {
        console.error('Fehler beim Verarbeiten der aktuellen Wetterdaten:', err);
        return of(null); // Rückgabe eines sinnvollen Defaults
      }),
    );
  }

  processHourlyWeather(): Observable<HourlyForecastData | null> {
    return this.weatherAPIService.getHourlyForecast().pipe(
      map((hourlyForecast) => {
        if (hourlyForecast) {
          // Hier kommen die Logik und die Datenverarbeitung
          // console.log('Stündliche Vorhersage:', hourlyForecast);
          return {
            // Stündliche Vorhersage
            blitzPotenzial: hourlyForecast.hourly.lightning_potential,
            niederschlagH: hourlyForecast.hourly.precipitation,
            regenH: hourlyForecast.hourly.rain,
            schauerH: hourlyForecast.hourly.showers,
            schneeH: hourlyForecast.hourly.snowfall,
            zeitStempelH: hourlyForecast.hourly.time,
            windRichtung: hourlyForecast.hourly.wind_direction_10m,
            windGeschw: hourlyForecast.hourly.wind_speed_10m,
          };
        }
        return null; // Falls Daten fehlen
      }),
      catchError(err => {
        console.error('Fehler beim Verarbeiten der stündlichen:', err);
        return of(null); // Rückgabe eines sinnvollen Defaults
      }),
    );
  }

  processAirQuality(): Observable<AirQualityData | null> {
    return this.weatherAPIService.getAirQualityForecast().pipe(
      map((airQualityForecast) => {
        if (airQualityForecast) {
          // console.log('Luftqualitätsvorhersage:', airQualityForecast);
          return {
            // Luftqualität
            erlenPollen: airQualityForecast.hourly.alder_pollen,
            birkenPollen: airQualityForecast.hourly.birch_pollen,
            graeserPollen: airQualityForecast.hourly.grass_pollen,
            beifussPollen: airQualityForecast.hourly.mugwort_pollen,
            olivenPollen: airQualityForecast.hourly.olive_pollen,
            ambrosiaPollen: airQualityForecast.hourly.ragweed_pollen,
            UVIndex: airQualityForecast.hourly.uv_index,
            UVIndexKlarerHimmel: airQualityForecast.hourly.uv_index_clear_sky,
            zeitStempelLuft: airQualityForecast.hourly.time,
          };
        }
        return null; // Falls Daten fehlen
      }),
      catchError(err => {
        console.error('Fehler beim Verarbeiten der Air Daten:', err);
        return of(null); // Rückgabe eines sinnvollen Defaults
      }),
    );
  }

  processTodaysWeather(): Observable<TodaysWeatherData | null> {
    return this.weatherAPIService.getTodaysForecast().pipe(
      map((todaysWeather) => {
        if (todaysWeather) {
          // console.log('Tägliches Wetter:', todaysWeather);
          return {
            tageslängenDauer: todaysWeather.daily.daylight_duration[0], // "s"
            niederschlagsStunden: todaysWeather.daily.precipitation_hours[0], // "h"
            niederschlagsWahrscheinlichkeitMaxD: todaysWeather.daily.precipitation_probability_max[0], // "%"
            sonnenaufgang: todaysWeather.daily.sunrise[0], //'YYYY-MM-DDTHH:MM'
            sonnenuntergang: todaysWeather.daily.sunset[0], //'YYYY-MM-DDTHH:MM'
            sonnenscheinDauer: todaysWeather.daily.sunshine_duration[0], // "s"
            zeitStempelD: todaysWeather.daily.time[0], //'YYYY-MM-DD'
          };
        }
        return null;
      }),
      catchError(err => {
        console.error('Fehler beim Verarbeiten der täglichen Wetterdaten:', err);
        return of(null); // Rückgabe eines sinnvollen Defaults
      })
    );
  }

  processForecastWeather(): Observable<ForecastWeatherData | null> {
    return this.weatherAPIService.get10DaysForecast().pipe(
      map((forecastWeather) => {
        if (forecastWeather) {
          // console.log('10 Days Wetter Forecast:', forecastWeather);
          return {
            niederschlagsWahrscheinlichkeitMaxF: forecastWeather.daily.precipitation_probability_max[0], // Max. Niederschlagswahrscheinlichkeit
            temperaturMaxF: forecastWeather.daily.temperature_2m_max[0], // Max. Temperatur in °C
            temperaturMinF: forecastWeather.daily.temperature_2m_min[0], // Min. Temperatur in °C
            zeitStempelF: forecastWeather.daily.time[0], // Datum im ISO-Format
            wetterCodeF: forecastWeather.daily.weather_code[0], // Wetterbeschreibung oder WMO Code
          };
        }
        return null;
      }),
      catchError(err => {
        console.error('Fehler beim Verarbeiten des täglichen 10 Days Forecast:', err);
        return of(null); // Rückgabe eines sinnvollen Defaults
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
      .map((array) => this.getNextEvent(array, 50, 'pollen-icon'))
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

  private getWeatherDescription(weatherCode: number): WeatherDescriptionData | null {
    // Hier könnte eine tatsächliche Mapping-Logik stehen
    const weatherDescriptions: { [key: number]: { description: string, icon: string } } = {
      0: { description: 'Klarer Himmel', icon: 'clear_day' },
      1: { description: 'Meistens klar', icon: 'partly-cloudy_day' },
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
