import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAgents } from './users-agents';

describe('UsersAgents', () => {
  let component: UsersAgents;
  let fixture: ComponentFixture<UsersAgents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersAgents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersAgents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
