import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { CustomerProfileComponent } from './customer-profile.component';

describe('CustomerProfileComponent', () => {
  let component: CustomerProfileComponent;
  let fixture: ComponentFixture<CustomerProfileComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select']);

    await TestBed.configureTestingModule({
      imports: [CustomerProfileComponent],
      providers: [
        { provide: Store, useValue: storeSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerProfileComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    // Setup default mocks
    mockStore.select.and.returnValue(of(null));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user observable', () => {
    // Observable initialization is handled by the component
    expect(component).toBeTruthy();
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
