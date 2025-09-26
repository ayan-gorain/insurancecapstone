import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Actions } from '@ngrx/effects';

import { CustomerClaimsComponent } from './customer-claims.component';
import { CustomerPolicy } from '../../../services/customer-policy';

describe('CustomerClaimsComponent', () => {
  let component: CustomerClaimsComponent;
  let fixture: ComponentFixture<CustomerClaimsComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockCustomerPolicy: jasmine.SpyObj<CustomerPolicy>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const customerPolicySpy = jasmine.createSpyObj('CustomerPolicy', ['checkAgentAssignment']);
    const mockActions = of({ type: 'TEST_ACTION' });

    await TestBed.configureTestingModule({
      imports: [CustomerClaimsComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: CustomerPolicy, useValue: customerPolicySpy },
        { provide: Actions, useValue: mockActions }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerClaimsComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockCustomerPolicy = TestBed.inject(CustomerPolicy) as jasmine.SpyObj<CustomerPolicy>;

    // Setup default mocks
    mockStore.select.and.returnValue(of({}));
    mockCustomerPolicy.checkAgentAssignment.and.returnValue(of({ hasAssignedAgent: false, assignedAgent: null }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showClaimForm).toBeFalse();
    expect(component.claimImages).toEqual([]);
    expect(component.hasAssignedAgent).toBeFalse();
    expect(component.assignedAgent).toBeNull();
  });

  it('should initialize claim form with correct validators', () => {
    expect(component.claimForm.get('incidentDate')?.hasError('required')).toBeTrue();
    expect(component.claimForm.get('incidentLocation')?.hasError('required')).toBeTrue();
    expect(component.claimForm.get('description')?.hasError('required')).toBeTrue();
    expect(component.claimForm.get('amount')?.hasError('required')).toBeTrue();
    expect(component.claimForm.get('policyType')?.value).toBe('GENERAL');
  });

  it('should dispatch loadMyClaims action', () => {
    component.loadMyClaims();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should dispatch loadClaimStats action', () => {
    component.loadClaimStats();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should check agent assignment on init', () => {
    const mockResponse = { hasAssignedAgent: true, assignedAgent: { name: 'Test Agent' } };
    mockCustomerPolicy.checkAgentAssignment.and.returnValue(of(mockResponse));

    component.checkAgentAssignment();

    expect(component.hasAssignedAgent).toBeTrue();
    expect(component.assignedAgent).toEqual({ name: 'Test Agent' });
  });

  it('should handle agent assignment error', () => {
    mockCustomerPolicy.checkAgentAssignment.and.returnValue(throwError('Error'));

    component.checkAgentAssignment();

    expect(component.hasAssignedAgent).toBeFalse();
    expect(component.assignedAgent).toBeNull();
  });

  it('should handle claim images selection', () => {
    const mockFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
    ];
    const mockEvent = {
      target: {
        files: mockFiles
      }
    };

    component.onClaimImagesSelected(mockEvent);

    expect(component.claimImages).toEqual(mockFiles);
  });

  it('should not submit claim without assigned agent', () => {
    component.hasAssignedAgent = false;
    spyOn(window, 'alert');

    component.submitClaim();

    expect(window.alert).toHaveBeenCalledWith('You cannot submit claims until an agent is assigned to you. Please contact admin to get an agent assigned.');
  });

  it('should not submit claim with invalid form', () => {
    component.hasAssignedAgent = true;
    component.claimImages = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    component.claimForm.patchValue({
      incidentDate: '',
      incidentLocation: '',
      description: '',
      amount: ''
    });

    component.submitClaim();

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should not submit claim with insufficient images', () => {
    component.hasAssignedAgent = true;
    component.claimImages = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    component.claimForm.patchValue({
      incidentDate: '2023-12-01',
      incidentLocation: 'Test Location',
      description: 'Test description with enough length',
      amount: 1000
    });

    component.submitClaim();

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should reset claim form', () => {
    component.claimForm.patchValue({
      incidentDate: '2023-12-01',
      incidentLocation: 'Test Location',
      description: 'Test description',
      amount: 1000
    });
    component.claimImages = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];

    component.resetClaimForm();

    expect(component.claimForm.get('incidentDate')?.value).toBeNull();
    expect(component.claimImages).toEqual([]);
  });
});