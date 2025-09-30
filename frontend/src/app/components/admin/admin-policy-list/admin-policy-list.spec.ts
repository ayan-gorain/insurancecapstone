import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { Actions } from '@ngrx/effects';

import { AdminPolicyList } from './admin-policy-list.component';
import { CustomerPolicy } from '../../../services/customer-policy';

describe('AdminPolicyList', () => {
  let component: AdminPolicyList;
  let fixture: ComponentFixture<AdminPolicyList>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const mockActions = of({ type: 'TEST_ACTION' });
    const customerPolicySpy = jasmine.createSpyObj('CustomerPolicy', ['buyPolicy']);
    storeSpy.select.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminPolicyList],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Actions, useValue: mockActions },
        { provide: CustomerPolicy, useValue: customerPolicySpy }
      ]
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
