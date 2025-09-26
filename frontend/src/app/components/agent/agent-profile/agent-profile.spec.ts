import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { AgentProfile } from './agent-profile';

describe('AgentProfile', () => {
  let component: AgentProfile;
  let fixture: ComponentFixture<AgentProfile>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [AgentProfile],
      providers: [
        { provide: Store, useValue: storeSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentProfile);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
