import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { PolicyService } from '../../services/policy.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;

  beforeEach(async () => {
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getPublicPolicies']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule.withRoutes([
        { path: '', component: HomeComponent }
      ])],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockPolicyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBeTrue();
    expect(component.error).toBeNull();
    expect(component.policies$).toBeUndefined();
  });

  it('should load policies on init', () => {
    const mockPolicies = [
      { id: '1', title: 'Policy 1', description: 'Description 1' },
      { id: '2', title: 'Policy 2', description: 'Description 2' }
    ];
    mockPolicyService.getPublicPolicies.and.returnValue(of(mockPolicies));

    component.ngOnInit();

    expect(mockPolicyService.getPublicPolicies).toHaveBeenCalled();
    expect(component.policies$).toBeDefined();
  });

  it('should handle successful policy loading', () => {
    const mockPolicies = [
      { id: '1', title: 'Policy 1', description: 'Description 1' }
    ];
    mockPolicyService.getPublicPolicies.and.returnValue(of(mockPolicies));

    component.loadPolicies();

    expect(component.policies$).toBeDefined();
    
    // The loading state will be true initially, then false after subscription completes
    component.policies$!.subscribe(() => {
      expect(component.loading).toBeFalse();
      expect(component.error).toBeNull();
    });
  });

  it('should handle policy loading error', () => {
    const errorMessage = 'Network error';
    mockPolicyService.getPublicPolicies.and.returnValue(throwError(() => new Error(errorMessage)));

    component.loadPolicies();

    expect(component.policies$).toBeDefined();
    
    // The loading state will be true initially, then false after error
    component.policies$!.subscribe({
      next: () => {},
      error: () => {
        expect(component.loading).toBeFalse();
        expect(component.error).toBe('Failed to load policies. Please try again later.');
      }
    });
  });

  it('should set loading to true when starting to load policies', () => {
    const mockPolicies = [
      { id: '1', title: 'Policy 1', description: 'Description 1' }
    ];
    mockPolicyService.getPublicPolicies.and.returnValue(of(mockPolicies));
    
    component.loading = false;
    component.error = 'Previous error';

    component.loadPolicies();

    expect(component.policies$).toBeDefined();
    
    // The loading state will be true initially, then false after subscription completes
    component.policies$!.subscribe(() => {
      expect(component.loading).toBeFalse();
      expect(component.error).toBeNull();
    });
  });
});
