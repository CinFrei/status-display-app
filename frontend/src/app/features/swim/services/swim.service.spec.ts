import { TestBed } from '@angular/core/testing';

import { SwimService } from './swim.service';

describe('SwimService', () => {
  let service: SwimService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
