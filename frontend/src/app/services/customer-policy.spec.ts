import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CustomerPolicy } from './customer-policy';

describe('CustomerPolicy', () => {
  let service: CustomerPolicy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerPolicy]
    });
    service = TestBed.inject(CustomerPolicy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
