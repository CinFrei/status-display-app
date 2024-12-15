import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherAPIService } from './weather-api.service';
import { TimersService } from '../../../core/services/timers.service';
import { of } from 'rxjs';

// Mock-Daten
const mockCurrentForecast = { temperature: 20 };
const mockHourlyForecast = { hours: [{ hour: 1, temp: 18 }] };
const mockTodaysForecast = { maxTemp: 22, minTemp: 15 };
const mockTenDaysForecast = { days: [{ day: 'Monday', maxTemp: 25 }] };
const mockAirQualityForecast = { uvIndex: 5 };

describe('WeatherAPIService', () => {
  let service: WeatherAPIService;
  let httpMock: HttpTestingController;
  let timersServiceSpy: jasmine.SpyObj<TimersService>;

  beforeEach(() => {
    const timersSpy = jasmine.createSpyObj('TimersService', ['getQuarterHourTimer', 'getHourlyTimer', 'getDailyTimer']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WeatherAPIService,
        { provide: TimersService, useValue: timersSpy },
      ],
    });

    service = TestBed.inject(WeatherAPIService);
    httpMock = TestBed.inject(HttpTestingController);
    timersServiceSpy = TestBed.inject(TimersService) as jasmine.SpyObj<TimersService>;

    // Timer-Spies konfigurieren
    timersServiceSpy.getQuarterHourTimer.and.returnValue(of(0));
    timersServiceSpy.getHourlyTimer.and.returnValue(of(0));
    timersServiceSpy.getDailyTimer.and.returnValue(of(0));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should fetch current forecast data', () => {
  //   service.getCurrentForecast().subscribe((data) => {
  //     expect(data).toEqual(mockCurrentForecast);
  //   });

  //   const req = httpMock.expectOne((req) => req.url.includes('minutely_15'));
  //   expect(req.request.method).toBe('GET');
  //   req.flush(mockCurrentForecast);
  // });

  // it('should fetch hourly forecast data', () => {
  //   service.getHourlyForecast().subscribe((data) => {
  //     expect(data).toEqual(mockHourlyForecast);
  //   });

  //   const req = httpMock.expectOne((req) => req.url.includes('hourly'));
  //   expect(req.request.method).toBe('GET');
  //   req.flush(mockHourlyForecast);
  // });

  // it('should fetch today\'s forecast data', () => {
  //   service.getTodaysForecast().subscribe((data) => {
  //     expect(data).toEqual(mockTodaysForecast);
  //   });

  //   const req = httpMock.expectOne((req) => req.url.includes('forecast_days=1'));
  //   expect(req.request.method).toBe('GET');
  //   req.flush(mockTodaysForecast);
  // });

  // it('should fetch 10 days forecast data', () => {
  //   service.get10DaysForecast().subscribe((data) => {
  //     expect(data).toEqual(mockTenDaysForecast);
  //   });

  //   const req = httpMock.expectOne((req) => req.url.includes('forecast_days=10'));
  //   expect(req.request.method).toBe('GET');
  //   req.flush(mockTenDaysForecast);
  // });

  // it('should fetch air quality forecast data', () => {
  //   service.getAirQualityForecast().subscribe((data) => {
  //     expect(data).toEqual(mockAirQualityForecast);
  //   });

  //   const req = httpMock.expectOne((req) => req.url.includes('air-quality'));
  //   expect(req.request.method).toBe('GET');
  //   req.flush(mockAirQualityForecast);
  // });

  it('should handle errors gracefully', () => {
    service.getCurrentForecast().subscribe((data) => {
      expect(data).toBeNull();
    });

    const req = httpMock.expectOne((req) => req.url.includes('minutely_15'));
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
