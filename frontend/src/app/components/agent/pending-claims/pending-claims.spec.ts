import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingClaims } from './pending-claims';

describe('PendingClaims', () => {
  let component: PendingClaims;
  let fixture: ComponentFixture<PendingClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingClaims]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingClaims);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
