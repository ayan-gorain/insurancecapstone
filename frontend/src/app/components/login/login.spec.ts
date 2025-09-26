import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { selectUser, selectLoading, selectError } from '../../store/auth/auth.selectors';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: {}, queryParams: {} },
      params: of({}),
      queryParams: of({})
    });

    // Setup default mocks - return different observables for different selectors
    storeSpy.select.and.callFake((selector: any) => {
      if (selector === selectLoading) {
        return of(false);
      } else if (selector === selectError) {
        return of(null);
      } else if (selector === selectUser) {
        return of(null);
      }
      return of(null);
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule.withRoutes([
        { path: '', component: LoginComponent },
        { path: 'home', component: LoginComponent },
        { path: 'signup', component: LoginComponent },
        { path: 'admin', component: LoginComponent },
        { path: 'customer', component: LoginComponent }
      ])],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showPassword).toBeFalse();
    expect(component.showWelcomeMessage).toBeFalse();
    expect(component.form).toBeDefined();
  });

  it('should initialize form with required validators', () => {
    expect(component.form.get('email')?.hasError('required')).toBeTrue();
    expect(component.form.get('password')?.hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    component.form.patchValue({
      email: 'invalid-email',
      password: 'password123'
    });

    expect(component.form.get('email')?.hasError('email')).toBeTrue();
    expect(component.form.valid).toBeFalse();
  });

  it('should accept valid email format', () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(component.form.get('email')?.hasError('email')).toBeFalse();
    expect(component.form.valid).toBeTrue();
  });

  it('should reset form', () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.showPassword = true;

    component.resetForm();

    expect(component.form.get('email')?.value).toBeNull();
    expect(component.form.get('password')?.value).toBeNull();
    expect(component.showPassword).toBeFalse();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should dispatch login action on valid form submission', () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(component.showWelcomeMessage).toBeTrue();
  });

  it('should not dispatch login action on invalid form', () => {
    component.form.patchValue({
      email: 'invalid-email',
      password: ''
    });

    component.onSubmit();

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should redirect admin user to admin dashboard', fakeAsync(() => {
    // Reset router spy to clear any previous calls
    mockRouter.navigate.calls.reset();
    
    const adminUser = { role: 'admin' };
    
    // Set up the mock store selector before creating the component
    mockStore.select.and.callFake((selector: any) => {
      if (selector === selectUser) {
        return of(adminUser);
      } else if (selector === selectLoading) {
        return of(false);
      } else if (selector === selectError) {
        return of(null);
      }
      return of(null);
    });

    // Create a new component instance for this test
    const testFixture = TestBed.createComponent(LoginComponent);
    const testComponent = testFixture.componentInstance;
    testComponent.ngOnInit();
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  }));

  it('should redirect customer user to customer dashboard', fakeAsync(() => {
    // Reset router spy to clear any previous calls
    mockRouter.navigate.calls.reset();
    
    const customerUser = { role: 'customer' };
    
    // Set up the mock store selector before creating the component
    mockStore.select.and.callFake((selector: any) => {
      if (selector === selectUser) {
        return of(customerUser);
      } else if (selector === selectLoading) {
        return of(false);
      } else if (selector === selectError) {
        return of(null);
      }
      return of(null);
    });

    // Create a new component instance for this test
    const testFixture = TestBed.createComponent(LoginComponent);
    const testComponent = testFixture.componentInstance;
    testComponent.ngOnInit();
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/customer']);
  }));

  it('should not redirect when no user is logged in', () => {
    // Reset router spy to clear any previous calls
    mockRouter.navigate.calls.reset();
    
    mockStore.select.and.callFake((selector: any) => {
      if (selector === selectUser) {
        return of(null);
      } else if (selector === selectLoading) {
        return of(false);
      } else if (selector === selectError) {
        return of(null);
      }
      return of(null);
    });

    component.ngOnInit();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should not redirect when showWelcomeMessage is true', () => {
    // Reset router spy to clear any previous calls
    mockRouter.navigate.calls.reset();
    
    const user = { role: 'admin' };
    component.showWelcomeMessage = true;
    mockStore.select.and.callFake((selector: any) => {
      if (selector === selectUser) {
        return of(user);
      } else if (selector === selectLoading) {
        return of(false);
      } else if (selector === selectError) {
        return of(null);
      }
      return of(null);
    });

    component.ngOnInit();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle onInputChange', () => {
    expect(() => component.onInputChange()).not.toThrow();
  });

  it('should initialize observables', () => {
    expect(component.loading$).toBeDefined();
    expect(component.error$).toBeDefined();
    expect(component.user$).toBeDefined();
  });
});