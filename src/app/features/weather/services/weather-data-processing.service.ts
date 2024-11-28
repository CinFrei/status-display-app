import { Injectable } from '@angular/core';
import { WeatherAPIService } from './weather-api.service';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, tap } from 'rxjs';

type WeatherDescription = {
  description: string,
  icon: string
};

export interface CurrentWeatherResponse {
  minutely_15: {
    precipitation: number[];
    relative_humidity_2m: number[];
    temperature_2m: number[];
    time: string[];
    weather_code: number[];
  };
}

export interface HourlyForecastResponse {
  hourly: {
    wind_speed_10m: any;
    wind_direction_10m: any;
    showers: any;
    rain: any;
    lightning_potential: number[];
    precipitation: number[];
    snowfall: number[];
    time: string[];
  };
}

export interface AirQualityForecastResponse {
  hourly: {
    ragweed_pollen: any;
    olive_pollen: any;
    grass_pollen: any;
    mugwort_pollen: any;
    birch_pollen: any;
    uv_index: number[];
    uv_index_clear_sky: number[];
    alder_pollen: number[];
    time: string[];
  };
}

export interface CurrentWeather {
  // 15-Minuten-Daten
  niederschlag15: number;
  luftfeuchtigkeit15: number;
  temperatur: number;
  zeitStempel15: string;
  wetterCode15: number | WeatherDescription;

  // Stündliche Vorhersage
  blitzPotenzial: number[];
  niederschlagH: number[];
  regenH: number[];
  schauerH: number[];
  schneeH: number[];
  zeitStempelH: string[];
  windRichtung: number[];
  windGeschw: number[];

  // Luftqualität
  erlenpollen: number[];
  birkenpollen: number[];
  graeserpollen: number[];
  beifußpollen: number[];
  olivenpollen: number[];
  ambrosiapollen: number[];
  zeitStempelLuft: string[];
  UVIndex: number[];
  UVIndexKlarerHimmel: number[];

  // Kompakte Events
  kompakt: { icon: string; value: string }[];
}

export interface TodaysWeather {
  tageslängenDauer: number; // Tageslänge in Sekunden
  niederschlagsStunden: number; // Niederschlagsstunden
  niederschlagsWahrscheinlichkeitMaxD: number; // Max. Niederschlagswahrscheinlichkeit
  sonnenaufgang: string; // Sonnenaufgangszeit
  sonnenuntergang: string; // Sonnenuntergangszeit
  sonnenscheinDauer: number; // Sonnenscheindauer in Sekunden
  zeitStempelD: string; // Zeitstempel des Tages
}

export interface ForecastWeather {
  niederschlagsWahrscheinlichkeitMaxF: number; // Max. Niederschlagswahrscheinlichkeit
  temperaturMaxF: number; // Max. Temperatur in °C
  temperaturMinF: number; // Min. Temperatur in °C
  zeitStempelF: string; // Datum im ISO-Format
  wetterCodeF: WeatherDescription | number; // Wetterbeschreibung oder WMO Code
}

@Injectable({
  providedIn: 'root'
})
export class WeatherDataProcessingService {
  constructor(private weatherAPIService: WeatherAPIService) { }

  /*
  * Wandelt die Wetterdaten um und gibt sie in einer benutzerfreundlicheren Form zurück.
  */

  processCurrentWeather(): Observable<CurrentWeather | null> {
    return forkJoin({
      currentWeather: this.weatherAPIService.getCurrentForecast(),
      hourlyForecast: this.weatherAPIService.getHourlyForecast(),
      airQualityForecast: this.weatherAPIService.getAirQualityForecast(),
    }).pipe(
      map(({ currentWeather, hourlyForecast, airQualityForecast }) => {
        if (currentWeather && hourlyForecast && airQualityForecast) {
          // Hier kommen die Logik und die Datenverarbeitung
          console.log('Aktuelles Wetter:', currentWeather);
          console.log('Stündliche Vorhersage:', hourlyForecast);
          console.log('Luftqualitätsvorhersage:', airQualityForecast);
          return this.processWeatherData(currentWeather, hourlyForecast, airQualityForecast);
        }
        return null; // Falls Daten fehlen
      }),
      catchError(err => {
        console.error('Fehler beim Verarbeiten der aktuellen Wetterdaten:', err);
        return of(null); // Rückgabe eines sinnvollen Defaults
      }),
    );
  }

  private processWeatherData(
    currentWeather: CurrentWeatherResponse,
    hourlyForecast: HourlyForecastResponse,
    airQualityForecast: AirQualityForecastResponse
  ): CurrentWeather {
    // Kompakte Events vorbereiten
    const kompakt = [
      this.getNextEvent(hourlyForecast.hourly.precipitation, "Niederschlag", "umbrella"),
      this.getNextEvent(hourlyForecast.hourly.snowfall, "Schnee", "snowflake"),
      this.getNextEvent(hourlyForecast.hourly.lightning_potential, "Gewitter", "thunderstorm"),
    ].filter((event): event is { icon: string; value: string } => event !== null);


    if (airQualityForecast.hourly.uv_index[0] > 25) {
      kompakt.push({ icon: 'sunlotion', value: 'UV hoch' });
    }

    if (airQualityForecast.hourly.uv_index_clear_sky[0] > 25) {
      kompakt.push({ icon: 'sunglases', value: 'UV hoch' });
    }

    if (this.checkPollenSpread(
      ...[
        airQualityForecast.hourly.alder_pollen[0],
        airQualityForecast.hourly.birch_pollen[0],
        airQualityForecast.hourly.grass_pollen[0],
        airQualityForecast.hourly.mugwort_pollen[0],
        airQualityForecast.hourly.olive_pollen[0],
        airQualityForecast.hourly.ragweed_pollen[0]
      ]
    )) {
      kompakt.push({ icon: 'allergy', value: 'Pollenflug' });
    }

    // Werte für 15-Minuten-Intervall
    const niederschlag15 = currentWeather.minutely_15.precipitation[0];
    const luftfeuchtigkeit15 = currentWeather.minutely_15.relative_humidity_2m[0];
    const temperatur = currentWeather.minutely_15.temperature_2m[0];
    const zeitStempel15 = currentWeather.minutely_15.time[0];
    const wetterCode15 = this.getWeatherDescription(currentWeather.minutely_15.weather_code[0]);

    // Stündliche Vorhersage
    const blitzPotenzial = hourlyForecast.hourly.lightning_potential;
    const niederschlagH = hourlyForecast.hourly.precipitation;
    const regenH = hourlyForecast.hourly.rain;
    const schauerH = hourlyForecast.hourly.showers;
    const schneeH = hourlyForecast.hourly.snowfall;
    const zeitStempelH = hourlyForecast.hourly.time;
    const windRichtung = hourlyForecast.hourly.wind_direction_10m;
    const windGeschw = hourlyForecast.hourly.wind_speed_10m;

    // Luftqualität
    const erlenpollen = airQualityForecast.hourly.alder_pollen;
    const birkenpollen = airQualityForecast.hourly.birch_pollen;
    const graeserpollen = airQualityForecast.hourly.grass_pollen;
    const beifußpollen = airQualityForecast.hourly.mugwort_pollen;
    const olivenpollen = airQualityForecast.hourly.olive_pollen;
    const ambrosiapollen = airQualityForecast.hourly.ragweed_pollen;
    const UVIndex = airQualityForecast.hourly.uv_index;
    const UVIndexKlarerHimmel = airQualityForecast.hourly.uv_index_clear_sky;
    const zeitStempelLuft = airQualityForecast.hourly.time;

    return {
      kompakt,
      niederschlag15,
      luftfeuchtigkeit15,
      temperatur,
      zeitStempel15,
      wetterCode15,
      zeitStempelLuft,
      blitzPotenzial,
      niederschlagH,
      regenH,
      schauerH,
      schneeH,
      zeitStempelH,
      windRichtung,
      windGeschw,
      erlenpollen,
      birkenpollen,
      graeserpollen,
      beifußpollen,
      olivenpollen,
      ambrosiapollen,
      UVIndex,
      UVIndexKlarerHimmel,
    };
  }

  processTodaysWeather(): Observable<TodaysWeather | null> {
    return this.weatherAPIService.getTodaysForecast().pipe(
      map((todaysWeather) => {
        if (todaysWeather) {
          console.log('Tägliches Wetter:', todaysWeather);
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

  processForecastWeather(): Observable<ForecastWeather | null> {
    return this.weatherAPIService.get10DaysForecast().pipe(
      map((forecastWeather) => {
        if (forecastWeather) {
          console.log('10 Days Wetter Forecast:', forecastWeather);
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
  private checkPollenSpread(...pollenValues: number[]): boolean {
    // Beispiel: Schwellenwert ab 50 grains/m³
    return pollenValues.some(value => value > 50); // Beispielschwelle
  }

  private getNextEvent(values: number[], description: string, icon: string
  ): { icon: string; value: string } | null {
    // Beispiel: Suche den ersten relevanten Wert (z. B. größer als 0)
    const index = values.findIndex((wert) => wert > 0);
    if (index !== -1) {
      return { icon, value: `${index + 1}h` };
    }
    return null;
  }

  private getWeatherDescription(weatherCode: number): WeatherDescription | number {
    // Hier könnte eine tatsächliche Mapping-Logik stehen
    const weatherDescriptions: { [key: number]: { description: string, icon: string } } = {
      0: { description: 'Klarer Himmel', icon: 'sun' },
      1: { description: 'Meistens klar', icon: 'partly-cloudy' },
      2: { description: 'Teilweise bewölkt', icon: 'partly-cloudy' },
      3: { description: 'Bewölkt', icon: 'cloudy' },
      45: { description: 'Nebel', icon: 'fog' },
      48: { description: 'Reifennebel', icon: 'fog' },
      51: { description: 'Leichter Nieselregen', icon: 'drizzle' },
      53: { description: 'Mäßiger Nieselregen', icon: 'drizzle' },
      55: { description: 'Dichter Nieselregen', icon: 'drizzle' },
      56: { description: 'Leichter gefrierender Nieselregen', icon: 'freezing-drizzle' },
      57: { description: 'Dichter gefrierender Nieselregen', icon: 'freezing-drizzle' },
      61: { description: 'Leichter Regen', icon: 'rain' },
      63: { description: 'Mäßiger Regen', icon: 'rain' },
      65: { description: 'Starker Regen', icon: 'rain' },
      66: { description: 'Leichter gefrierender Regen', icon: 'freezing-rain' },
      67: { description: 'Starker gefrierender Regen', icon: 'freezing-rain' },
      71: { description: 'Leichter Schneefall', icon: 'snow' },
      73: { description: 'Mäßiger Schneefall', icon: 'snow' },
      75: { description: 'Starker Schneefall', icon: 'snow' },
      77: { description: 'Schneekörner', icon: 'snowflakes' },
      80: { description: 'Leichte Regenschauer', icon: 'rain-showers' },
      81: { description: 'Mäßige Regenschauer', icon: 'rain-showers' },
      82: { description: 'Heftige Regenschauer', icon: 'rain-showers' },
      85: { description: 'Leichte Schneeschauer', icon: 'snow-showers' },
      86: { description: 'Starke Schneeschauer', icon: 'snow-showers' },
      95: { description: 'Leichter Gewitterregen', icon: 'thunderstorm' },
      96: { description: 'Mäßiger Gewitterregen', icon: 'thunderstorm' },
      99: { description: 'Starkes Gewitter mit Hagel', icon: 'thunderstorm-hail' },
    };
    return weatherDescriptions[weatherCode] || 'Unbekannt';
  }
}
