import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SummaryDashboardComponent } from './summary-dashboard.component';

describe('SummaryDashboardComponent', () => {
  let component: SummaryDashboardComponent;
  let fixture: ComponentFixture<SummaryDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDashboardComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null summary data', () => {
    expect(component.summaryData).toBeNull();
    expect(component.loading).toBeTrue();
    expect(component.error).toBeNull();
  });

  it('should load summary data on init', () => {
    spyOn(component, 'loadSummaryData');
    component.ngOnInit();
    expect(component.loadSummaryData).toHaveBeenCalled();
  });

  it('should calculate total claims correctly', () => {
    component.summaryData = {
      users: 10,
      agents: 5,
      claimsPending: 3,
      claimsApproved: 7,
      claimsRejected: 2,
      policies: 15
    };

    const totalClaims = component.getTotalClaims();
    expect(totalClaims).toBe(12); // 3 + 7 + 2
  });

  it('should return 0 for total claims when summary data is null', () => {
    component.summaryData = null;
    const totalClaims = component.getTotalClaims();
    expect(totalClaims).toBe(0);
  });

  it('should calculate claims approval rate correctly', () => {
    component.summaryData = {
      users: 10,
      agents: 5,
      claimsPending: 3,
      claimsApproved: 6,
      claimsRejected: 1,
      policies: 15
    };

    const approvalRate = component.getClaimsApprovalRate();
    expect(approvalRate).toBe(60); // (6 / 10) * 100 = 60%
  });

  it('should return 0 for approval rate when summary data is null', () => {
    component.summaryData = null;
    const approvalRate = component.getClaimsApprovalRate();
    expect(approvalRate).toBe(0);
  });

  it('should return 0 for approval rate when total claims is 0', () => {
    component.summaryData = {
      users: 10,
      agents: 5,
      claimsPending: 0,
      claimsApproved: 0,
      claimsRejected: 0,
      policies: 15
    };

    const approvalRate = component.getClaimsApprovalRate();
    expect(approvalRate).toBe(0);
  });

  it('should round approval rate to nearest integer', () => {
    component.summaryData = {
      users: 10,
      agents: 5,
      claimsPending: 1,
      claimsApproved: 3,
      claimsRejected: 0,
      policies: 15
    };

    const approvalRate = component.getClaimsApprovalRate();
    expect(approvalRate).toBe(75); // (3 / 4) * 100 = 75%
  });
});
