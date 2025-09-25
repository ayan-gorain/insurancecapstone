import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPolicyList } from './admin-policy-list';

describe('AdminPolicyList', () => {
  let component: AdminPolicyList;
  let fixture: ComponentFixture<AdminPolicyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPolicyList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPolicyList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
