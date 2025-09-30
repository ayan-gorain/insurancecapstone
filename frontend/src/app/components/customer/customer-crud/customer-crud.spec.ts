import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { CustomerCrud } from './customer-crud.component';

describe('CustomerCrud', () => {
  let component: CustomerCrud;
  let fixture: ComponentFixture<CustomerCrud>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    await TestBed.configureTestingModule({
      imports: [CustomerCrud],
      providers: [
        { provide: Store, useValue: storeSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCrud);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    // Setup default mocks
    mockStore.select.and.returnValue(of({}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default form values', () => {
    expect(component.buyPolicyForm.policyId).toBe('');
    expect(component.buyPolicyForm.startDate).toBe('');
    expect(component.buyPolicyForm.termMonths).toBe(12);
    expect(component.buyPolicyForm.nominee).toBe('');
  });

  it('should load available and my policies on init', () => {
    spyOn(component, 'loadAvailablePolicies');
    spyOn(component, 'loadMyPolicies');

    component.ngOnInit();

    expect(component.loadAvailablePolicies).toHaveBeenCalled();
    expect(component.loadMyPolicies).toHaveBeenCalled();
  });

  it('should dispatch loadAvailablePolicies action', () => {
    component.loadAvailablePolicies();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should dispatch loadMyPolicies action', () => {
    component.loadMyPolicies();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should not buy policy with missing required fields', () => {
    component.buyPolicyForm.startDate = '';
    component.buyPolicyForm.nominee = '';
    spyOn(window, 'alert');

    component.buyPolicy('test-policy-id');

    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields');
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should not buy policy with past start date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    component.buyPolicyForm.startDate = yesterday.toISOString().split('T')[0];
    component.buyPolicyForm.nominee = 'Test Nominee';
    spyOn(window, 'alert');

    component.buyPolicy('test-policy-id');

    expect(window.alert).toHaveBeenCalledWith('Start date cannot be in the past');
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should buy policy with valid data', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    component.buyPolicyForm.startDate = tomorrow.toISOString().split('T')[0];
    component.buyPolicyForm.nominee = 'Test Nominee';
    component.buyPolicyForm.termMonths = 24;

    component.buyPolicy('test-policy-id');

    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(component.buyPolicyForm.policyId).toBe('');
    expect(component.buyPolicyForm.startDate).toBe('');
    expect(component.buyPolicyForm.termMonths).toBe(12);
    expect(component.buyPolicyForm.nominee).toBe('');
  });

  it('should cancel policy with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.cancelPolicy('test-policy-id');

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this policy?');
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should not cancel policy without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.cancelPolicy('test-policy-id');

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this policy?');
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should set policy for purchase', () => {
    component.setPolicyForPurchase('test-policy-id');
    expect(component.buyPolicyForm.policyId).toBe('test-policy-id');
  });

  it('should handle image error', () => {
    const mockEvent = {
      target: {
        style: { display: '' },
        nextElementSibling: {
          style: { display: '' }
        }
      }
    };

    component.onImageError(mockEvent);

    expect(mockEvent.target.style.display).toBe('none');
    expect(mockEvent.target.nextElementSibling.style.display).toBe('flex');
  });

  it('should handle image error without next element sibling', () => {
    const mockEvent = {
      target: {
        style: { display: '' },
        nextElementSibling: null
      }
    };

    expect(() => component.onImageError(mockEvent)).not.toThrow();
    expect(mockEvent.target.style.display).toBe('none');
  });
});
