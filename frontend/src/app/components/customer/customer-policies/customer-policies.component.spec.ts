import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { CustomerPoliciesComponent } from './customer-policies.component';

describe('CustomerPoliciesComponent', () => {
  let component: CustomerPoliciesComponent;
  let fixture: ComponentFixture<CustomerPoliciesComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    await TestBed.configureTestingModule({
      imports: [CustomerPoliciesComponent, FormsModule],
      providers: [
        { provide: Store, useValue: storeSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerPoliciesComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    // Setup default mocks
    mockStore.select.and.returnValue(of({
      availablePolicies: [],
      myPolicies: [],
      loading: false,
      error: null
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activeTab).toBe('available');
    expect(component.isProcessingPurchase).toBeFalse();
    expect(component.purchaseSuccess).toBeFalse();
    expect(component.purchaseError).toBeFalse();
    expect(component.processingStep).toBe(0);
    expect(component.progressPercentage).toBe(0);
    expect(component.cancellingPolicyId).toBe('');
  });

  it('should initialize form with default values', () => {
    expect(component.buyPolicyForm.policyId).toBe('');
    expect(component.buyPolicyForm.startDate).toBe('');
    expect(component.buyPolicyForm.termMonths).toBe(12);
    expect(component.buyPolicyForm.nominee).toBe('');
    expect(component.buyPolicyForm.paymentMethod).toBe('CREDIT_CARD');
  });

  it('should load policies on init', () => {
    spyOn(component, 'loadAvailablePolicies');
    spyOn(component, 'loadMyPolicies');
    spyOn(component, 'checkAuthenticationStatus');

    component.ngOnInit();

    expect(component.loadAvailablePolicies).toHaveBeenCalled();
    expect(component.loadMyPolicies).toHaveBeenCalled();
  });

  it('should get current payment details for credit card', () => {
    component.buyPolicyForm.paymentMethod = 'CREDIT_CARD';
    component.buyPolicyForm.cardNumber = '1234567890123456';

    const result = component.getCurrentPaymentDetails();

    expect(result).toBe('1234567890123456');
  });

  // Bank transfer reference removed; no test needed

  it('should get current payment details for PayPal', () => {
    component.buyPolicyForm.paymentMethod = 'PAYPAL';
    component.buyPolicyForm.upiId = 'test@paypal';

    const result = component.getCurrentPaymentDetails();

    expect(result).toBe('test@paypal');
  });

  it('should get current payment details for cash', () => {
    component.buyPolicyForm.paymentMethod = 'CASH';

    const result = component.getCurrentPaymentDetails();

    expect(result).toBe('CASH_PAYMENT');
  });

  it('should validate payment details for credit card', () => {
    component.buyPolicyForm.paymentMethod = 'CREDIT_CARD';
    component.buyPolicyForm.cardNumber = '1234567890123456';

    const result = component.isPaymentDetailsValid();

    expect(result).toBeTrue();
  });

  it('should invalidate payment details for short credit card number', () => {
    component.buyPolicyForm.paymentMethod = 'CREDIT_CARD';
    component.buyPolicyForm.cardNumber = '123456789012345';

    const result = component.isPaymentDetailsValid();

    expect(result).toBeFalse();
  });

  it('should validate payment details for PayPal with valid email', () => {
    component.buyPolicyForm.paymentMethod = 'PAYPAL';
    component.buyPolicyForm.upiId = 'test@paypal.com';

    const result = component.isPaymentDetailsValid();

    expect(result).toBeTrue();
  });

  it('should invalidate payment details for PayPal without @', () => {
    component.buyPolicyForm.paymentMethod = 'PAYPAL';
    component.buyPolicyForm.upiId = 'testpaypal';

    const result = component.isPaymentDetailsValid();

    expect(result).toBeFalse();
  });

  it('should validate payment details for cash', () => {
    component.buyPolicyForm.paymentMethod = 'CASH';

    const result = component.isPaymentDetailsValid();

    expect(result).toBeTrue();
  });

  it('should not buy policy with missing required fields', () => {
    component.buyPolicyForm.startDate = '';
    component.buyPolicyForm.nominee = '';
    spyOn(window, 'alert');

    component.buyPolicy('test-policy-id');

    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields');
  });

  it('should not buy policy with invalid payment details', () => {
    component.buyPolicyForm.startDate = '2024-12-01';
    component.buyPolicyForm.nominee = 'Test Nominee';
    component.buyPolicyForm.paymentMethod = 'CREDIT_CARD';
    component.buyPolicyForm.cardNumber = '123';
    spyOn(window, 'alert');

    component.buyPolicy('test-policy-id');

    expect(window.alert).toHaveBeenCalledWith('Please provide valid payment details');
  });

  it('should not buy policy with past start date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    component.buyPolicyForm.startDate = yesterday.toISOString().split('T')[0];
    component.buyPolicyForm.nominee = 'Test Nominee';
    component.buyPolicyForm.paymentMethod = 'CASH';
    spyOn(window, 'alert');

    component.buyPolicy('test-policy-id');

    expect(window.alert).toHaveBeenCalledWith('Start date cannot be in the past');
  });

  it('should switch tabs', () => {
    component.switchTab('purchased');
    expect(component.activeTab).toBe('purchased');

    component.switchTab('available');
    expect(component.activeTab).toBe('available');
  });

  it('should check if user can buy policies', () => {
    const adminUser = { role: 'admin' };
    const customerUser = { role: 'customer' };

    expect(component.canBuyPolicies(adminUser)).toBeFalse();
    expect(component.canBuyPolicies(customerUser)).toBeTrue();
    expect(component.canBuyPolicies(null)).toBeFalsy();
  });

  it('should track by policy ID', () => {
    const policy1 = { _id: 'policy1' };
    const policy2 = { _id: 'policy2' };

    expect(component.trackByPolicyId(0, policy1)).toBe('policy1');
    expect(component.trackByPolicyId(1, policy2)).toBe('policy2');
  });

  it('should get status class for different statuses', () => {
    expect(component.getStatusClass('ACTIVE')).toBe('text-green-600 font-semibold');
    expect(component.getStatusClass('PENDING')).toBe('text-yellow-600 font-semibold');
    expect(component.getStatusClass('CANCELLED')).toBe('text-red-600 font-semibold');
    expect(component.getStatusClass('EXPIRED')).toBe('text-gray-600 font-semibold');
    expect(component.getStatusClass('UNKNOWN')).toBe('text-gray-500');
  });

  it('should get assigned agent text', () => {
    const policyWithAgent = { assignedAgent: { name: 'Test Agent' } };
    const policyWithUserIdAgent = { userId: { assignedAgentId: { name: 'Test Agent' } } };
    const policyWithoutAgent = {};

    expect(component.getAssignedAgentText(policyWithAgent)).toBe('Test Agent');
    expect(component.getAssignedAgentText(policyWithUserIdAgent)).toBe('Test Agent');
    expect(component.getAssignedAgentText(policyWithoutAgent)).toBe('Not Assigned Client');
  });

  it('should get assigned agent class', () => {
    const policyWithAgent = { assignedAgent: { name: 'Test Agent' } };
    const policyWithoutAgent = {};

    expect(component.getAssignedAgentClass(policyWithAgent)).toBe('text-green-600 font-medium');
    expect(component.getAssignedAgentClass(policyWithoutAgent)).toBe('text-orange-500 font-medium');
  });

  it('should set policy for purchase', () => {
    component.setPolicyForPurchase('test-policy-id');
    expect(component.buyPolicyForm.policyId).toBe('test-policy-id');
  });

  it('should reset animation state', () => {
    component.isProcessingPurchase = true;
    component.purchaseSuccess = true;
    component.purchaseError = true;
    component.processingStep = 3;
    component.progressPercentage = 75;
    component.currentPolicyId = 'test-id';

    component.resetAnimationState();

    expect(component.isProcessingPurchase).toBeFalse();
    expect(component.purchaseSuccess).toBeFalse();
    expect(component.purchaseError).toBeFalse();
    expect(component.processingStep).toBe(0);
    expect(component.progressPercentage).toBe(0);
    expect(component.currentPolicyId).toBe('');
  });

  it('should get fallback image URL for different policy types', () => {
    expect(component.getFallbackImageUrl('Engine Insurance')).toContain('unsplash.com');
    expect(component.getFallbackImageUrl('Comprehensive Coverage')).toContain('unsplash.com');
    expect(component.getFallbackImageUrl('Liability Insurance')).toContain('unsplash.com');
    expect(component.getFallbackImageUrl('Unknown Policy')).toContain('unsplash.com');
  });

  it('should get image URL with fallback', () => {
    const originalUrl = 'https://example.com/image.jpg';
    const fallbackUrl = component.getImageUrl(originalUrl, 'Test Policy');

    expect(fallbackUrl).toBe(originalUrl);
  });

  it('should get fallback image URL when original is empty', () => {
    const fallbackUrl = component.getImageUrl('', 'Test Policy');

    expect(fallbackUrl).toContain('unsplash.com');
  });
});
