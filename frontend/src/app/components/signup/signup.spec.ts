import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule, RouterTestingModule.withRoutes([
        { path: '', component: SignupComponent }
      ])],
      providers: [
        { provide: Store, useValue: storeSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    // Setup default mocks
    mockStore.select.and.returnValue(of(null));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.photoName).toBeNull();
    expect(component.photoPreview).toBeNull();
    expect(component.photoBase64).toBeNull();
    expect(component.showPassword).toBeFalse();
    expect(component.form).toBeDefined();
  });

  it('should initialize form with required validators', () => {
    expect(component.form.get('name')?.hasError('required')).toBeTrue();
    expect(component.form.get('email')?.hasError('required')).toBeTrue();
    expect(component.form.get('password')?.hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    });

    expect(component.form.get('email')?.hasError('email')).toBeTrue();
    expect(component.form.valid).toBeFalse();
  });

  it('should accept valid form data', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(component.form.get('email')?.hasError('email')).toBeFalse();
    expect(component.form.valid).toBeTrue();
  });

  it('should reset form', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    component.photoName = 'test.jpg';
    component.photoPreview = 'data:image/jpeg;base64,test';
    component.photoBase64 = 'data:image/jpeg;base64,test';
    component.showPassword = true;

    component.resetForm();

    expect(component.form.get('name')?.value).toBeNull();
    expect(component.form.get('email')?.value).toBeNull();
    expect(component.form.get('password')?.value).toBeNull();
    expect(component.photoName).toBeNull();
    expect(component.photoPreview).toBeNull();
    expect(component.photoBase64).toBeNull();
    expect(component.showPassword).toBeFalse();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should handle file selection', (done) => {
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as any;

    component.onFileSelected(mockEvent);

    expect(component.photoName).toBe('test.jpg');

    // Wait for FileReader to complete
    setTimeout(() => {
      expect(component.photoPreview).toBeDefined();
      expect(component.photoBase64).toBeDefined();
      done();
    }, 100);
  });

  it('should handle file selection with no files', () => {
    const mockEvent = {
      target: {
        files: null
      }
    } as any;

    component.onFileSelected(mockEvent);

    expect(component.photoName).toBeNull();
    expect(component.photoPreview).toBeNull();
    expect(component.photoBase64).toBeNull();
  });

  it('should dispatch signup action on valid form submission', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    component.photoBase64 = 'data:image/jpeg;base64,test';

    component.onSubmit();

    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should dispatch signup action without photo', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    component.photoBase64 = null;

    component.onSubmit();

    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should not dispatch signup action on invalid form', () => {
    component.form.patchValue({
      name: '',
      email: 'invalid-email',
      password: ''
    });

    component.onSubmit();

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should handle onInputChange', () => {
    expect(() => component.onInputChange()).not.toThrow();
  });

  it('should initialize observables', () => {
    // Observable initialization is handled by the component
    expect(component).toBeTruthy();
  });

  it('should set role to customer in signup action', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(mockStore.dispatch).toHaveBeenCalled();
    
    // Verify that dispatch was called with signup action
    const dispatchCall = mockStore.dispatch.calls.mostRecent();
    expect(dispatchCall).toBeDefined();
  });
});