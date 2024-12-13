import { TestBed } from '@angular/core/testing';

import { AkkuService } from './akku.service';

describe('AkkuService', () => {
  let service: AkkuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AkkuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
