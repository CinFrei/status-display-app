export interface CurrentForecastAPI {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  minutely_15: {
    precipitation: number[];
    relative_humidity_2m: number[];
    temperature_2m: number[];
    time: string[];
    weather_code: number[];
  };
  minutely_15_units: {
    time: string; // 'iso8601'
    temperature_2m: string; // '°C'
    weather_code: string; // 'wmo code'
    relative_humidity_2m: string; // '%'
    precipitation: string; // 'mm'
  };
}

export interface HourlyForecastAPI {
  latitude: number;
  longitude: number;
  elevation: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  hourly: {
    time: string[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    lightning_potential: number[];
    precipitation: number[];
    rain: number[];
    showers: number[];
    snowfall: number[];
  };
  hourly_units: {
    time: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    lightning_potential: string;
    precipitation: string;
    rain: string;
    showers: string;
    snowfall: string;
  };
}

export interface TodaysForecastAPI {
  latitude: number;
  longitude: number;
  elevation: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  daily: {
    daylight_duration: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
    sunshine_duration: number[];
    time: string[];
  };
  daily_units: {
    daylight_duration: string;
    precipitation_hours: string;
    precipitation_probability_max: string;
    sunrise: string;
    sunset: string;
    sunshine_duration: string;
    time: string;
  };
}

export interface TenDaysForecastAPI {
  latitude: number;
  longitude: number;
  elevation: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_probability_max: string;
  };
}

export interface AirQualityForecastAPI {
  latitude: number;
  longitude: number;
  elevation: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  hourly: {
    time: string[];
    uv_index: number[];
    uv_index_clear_sky: number[];
    alder_pollen: number[];
    birch_pollen: number[];
    grass_pollen: number[];
    mugwort_pollen: number[];
    olive_pollen: number[];
    ragweed_pollen: number[];
  };
  hourly_units: {
    time: string;
    uv_index: string;
    uv_index_clear_sky: string;
    alder_pollen: string;
    birch_pollen: string;
    grass_pollen: string;
    mugwort_pollen: string;
    olive_pollen: string;
    ragweed_pollen: string;
  };
}
