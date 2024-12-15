import { TestBed } from '@angular/core/testing';

import { PublicTransportService } from './public-transport.service';

describe('PublicTransportService', () => {
  let service: PublicTransportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicTransportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
