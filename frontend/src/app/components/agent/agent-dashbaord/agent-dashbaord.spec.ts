import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentDashbaord } from './agent-dashbaord';

describe('AgentDashbaord', () => {
  let component: AgentDashbaord;
  let fixture: ComponentFixture<AgentDashbaord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentDashbaord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentDashbaord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
