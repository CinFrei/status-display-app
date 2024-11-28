import { TestBed } from '@angular/core/testing';

import { WeatherDataProcessingService } from './weather-data-processing.service';

describe('WeatherDataProcessingService', () => {
  let service: WeatherDataProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherDataProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
