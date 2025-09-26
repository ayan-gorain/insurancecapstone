import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentStats } from './agent-stats';

describe('AgentStats', () => {
  let component: AgentStats;
  let fixture: ComponentFixture<AgentStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
