import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: Store, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;

    // Mock store selectors
    mockStore.select.and.returnValue(of({ name: 'Admin User', role: 'admin' }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch logout action when logout is called', () => {
    component.logout();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });
});
