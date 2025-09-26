import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { AdminPolicyComponent } from './admin-policy.component';

describe('AdminPolicyComponent', () => {
  let component: AdminPolicyComponent;
  let fixture: ComponentFixture<AdminPolicyComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {} },
      params: of({}),
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [AdminPolicyComponent, ReactiveFormsModule],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPolicyComponent);
    component = fixture.componentInstance;

    // Mock store selectors
    mockStore.select.and.returnValue(of(false)); // loading
    mockStore.select.and.returnValue(of(null)); // error
    mockStore.select.and.returnValue(of(null)); // createdPolicy

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required validators', () => {
    expect(component.form.get('code')?.hasError('required')).toBeTruthy();
    expect(component.form.get('title')?.hasError('required')).toBeTruthy();
    expect(component.form.get('description')?.hasError('required')).toBeTruthy();
    expect(component.form.get('premium')?.hasError('required')).toBeTruthy();
    expect(component.form.get('termMonths')?.hasError('required')).toBeTruthy();
    expect(component.form.get('minSumInsured')?.hasError('required')).toBeTruthy();
  });

  it('should dispatch createPolicy action when form is valid and image is selected', () => {
    // Set form values
    component.form.patchValue({
      code: 'TEST-001',
      title: 'Test Policy',
      description: 'This is a test policy description',
      premium: 1000,
      termMonths: 12,
      minSumInsured: 50000
    });

    // Set image
    component.imageBase64 = 'data:image/jpeg;base64,test';

    // Submit form
    component.onSubmit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Policy] Create Policy',
        code: 'TEST-001',
        title: 'Test Policy',
        description: 'This is a test policy description',
        premium: 1000,
        termMonths: 12,
        minSumInsured: 50000,
        image: 'data:image/jpeg;base64,test'
      })
    );
  });

  it('should not dispatch action when form is invalid', () => {
    component.onSubmit();
    expect(mockStore.dispatch).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ type: '[Policy] Create Policy' })
    );
  });

  it('should not dispatch action when image is not selected', () => {
    component.form.patchValue({
      code: 'TEST-001',
      title: 'Test Policy',
      description: 'This is a test policy description',
      premium: 1000,
      termMonths: 12,
      minSumInsured: 50000
    });

    component.onSubmit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Policy] Create Policy Failure',
        error: 'Please select an image for the policy'
      })
    );
  });
});
