export interface WeatherDescriptionData {
  description: string,
  icon: string
};

export interface CompactData {
  icon: string,
  value: string
};

export interface CompactWeatherData {
  temperatur15: number;
  wetterCode15: WeatherDescriptionData;
  compact: CompactData[];
}

export interface ForecastWeatherData {
  niederschlagsWahrscheinlichkeitMaxF: number;
  temperaturMaxF: number;
  temperaturMinF: number;
  wetterCodeF: number;
  zeitStempelF: string;
}

export interface TodaysWeatherData {
  tageslängenDauer: number;
  niederschlagsStunden: number;
  niederschlagsWahrscheinlichkeitMaxD: number;
  sonnenaufgang: string;
  sonnenuntergang: string;
  sonnenscheinDauer: number;
  zeitStempelD: string;
}

export interface AirQualityData {
  erlenPollen: number[];
  birkenPollen: number[];
  graeserPollen: number[];
  beifussPollen: number[];
  olivenPollen: number[];
  ambrosiaPollen: number[];
  UVIndex: number[];
  UVIndexKlarerHimmel: number[];
  zeitStempelLuft: string[];
}

export interface HourlyForecastData {
  blitzPotenzial: number[];
  niederschlagH: number[];
  regenH: number[];
  schauerH: number[];
  schneeH: number[];
  windGeschw: number[];
  windRichtung: number[];
  zeitStempelH: string[];
}

export interface CurrentWeatherData {
  niederschlag15: number;
  luftfeuchtigkeit15: number;
  temperatur: number;
  zeitStempel15: string;
  wetterCode15: WeatherDescriptionData | null;
}

