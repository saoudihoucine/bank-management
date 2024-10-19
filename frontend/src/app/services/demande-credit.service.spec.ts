import { TestBed } from '@angular/core/testing';

import { DemandeCreditService } from './demande-credit.service';

describe('DemandeCreditService', () => {
  let service: DemandeCreditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeCreditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
