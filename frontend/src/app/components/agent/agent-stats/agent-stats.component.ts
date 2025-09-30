import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AgentActions from '../../../store/agent/agent.actions';
import * as AgentSelectors from '../../../store/agent/agent.selectors';

@Component({
  selector: 'app-agent-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-stats.component.html',
  styleUrl: './agent-stats.component.css'
})
export class AgentStats implements OnInit {
  loading$: Observable<boolean>;
  error$: Observable<any>;
  claimStats$: Observable<any>;
  dashboardStats$: Observable<any>;
  claimsByStatus$: Observable<any>;
  recentClaims$: Observable<any[]>;
  topCustomer$: Observable<any>;

  constructor(private store: Store<{ agent: any }>) {
    this.loading$ = this.store.select(AgentSelectors.selectLoading);
    this.error$ = this.store.select(AgentSelectors.selectError);
    this.claimStats$ = this.store.select(AgentSelectors.selectClaimStats);
    this.dashboardStats$ = this.store.select(AgentSelectors.selectDashboardStats);
    this.claimsByStatus$ = this.store.select(AgentSelectors.selectClaimsByStatus);
    this.recentClaims$ = this.store.select(AgentSelectors.selectRecentClaims);
    this.topCustomer$ = this.store.select(AgentSelectors.selectCustomerWithMostClaims);
  }

  ngOnInit(): void {
    this.store.dispatch(AgentActions.loadClaimStats());
    this.store.dispatch(AgentActions.loadClaims());
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'REJECTED': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'PENDING': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    }
  }
}
