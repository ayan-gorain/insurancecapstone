import { TestBed } from '@angular/core/testing';

import { CustomerPolicy } from './customer-policy';

describe('CustomerPolicy', () => {
  let service: CustomerPolicy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerPolicy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
