import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AgentActions from '../../../store/agent/agent.actions';
import * as AgentSelectors from '../../../store/agent/agent.selectors';

@Component({
  selector: 'app-agent-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-customers.html',
  styleUrl: './agent-customers.css'
})
export class AgentCustomers implements OnInit {
  customers$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  selectedCustomer$: Observable<any>;

  constructor(private store: Store<{ agent: any }>) {
    this.customers$ = this.store.select(AgentSelectors.selectCustomers);
    this.loading$ = this.store.select(AgentSelectors.selectLoading);
    this.error$ = this.store.select(AgentSelectors.selectError);
    this.selectedCustomer$ = this.store.select(AgentSelectors.selectSelectedCustomer);
  }

  ngOnInit(): void {
    this.store.dispatch(AgentActions.loadCustomers());
  }

  selectCustomer(customer: any): void {
    this.store.dispatch(AgentActions.selectCustomer({ customer }));
  }

  viewCustomerPolicies(customerId: string): void {
    this.store.dispatch(AgentActions.loadCustomerPolicies({ customerId }));
  }

  viewCustomerClaims(customerId: string): void {
    this.store.dispatch(AgentActions.loadCustomerClaims({ customerId }));
  }

  clearSelection(): void {
    this.store.dispatch(AgentActions.clearSelectedCustomer());
  }
}
