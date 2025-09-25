import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { AgentDashboardComponent } from './agent-dashboard.component';

describe('AgentDashboardComponent', () => {
  let component: AgentDashboardComponent;
  let fixture: ComponentFixture<AgentDashboardComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    await TestBed.configureTestingModule({
      imports: [AgentDashboardComponent],
      providers: [
        { provide: Store, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentDashboardComponent);
    component = fixture.componentInstance;

    // Mock store selectors
    mockStore.select.and.returnValue(of({ name: 'Agent User', role: 'agent' }));

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
