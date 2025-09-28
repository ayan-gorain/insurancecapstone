import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Store} from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAllAgents, selectAllUsers } from '../../../store/user/user.selectors';
import { selectError, selectLoading } from '../../../store/auth/auth.selectors';
import * as UserActions from '../../../store/user/user.action';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-users-agents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-agents.html',
  styleUrl: './users-agents.css'
})
export class UsersAgents implements OnInit {
   users$: Observable<any[]>;
   agents$: Observable<any[]>;
   loading$: Observable<boolean>;
   error$: Observable<string | null>;
   view: 'users' | 'agents' | 'assignments' = 'users';
   selectedCustomer: any = null;
   selectedAgent: any = null;
   agentAssignments: { [customerId: string]: string } = {}; // customerId -> agentId
 
  constructor(private store: Store, private http: HttpClient){
    this.users$ = this.store.select(selectAllUsers);
    this.agents$ = this.store.select(selectAllAgents);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
  }

  showUsers(){
    this.view='users';
  }
  
  showAgents(){
    this.view='agents';
  }

  showAssignments(){
    this.view='assignments';
  }

  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'agent':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'customer':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  }

  getCustomers(): any[] {
    // Filter users to get only customers
    let customers: any[] = [];
    this.users$.subscribe(users => {
      customers = users?.filter(user => user.role === 'customer') || [];
    });
    return customers;
  }

  getAgentCustomerCount(agentId: string): number {
    // Count how many customers are assigned to this agent from the users data
    let count = 0;
    this.users$.subscribe(users => {
      count = users?.filter(user => user.role === 'customer' && user.assignedAgentId === agentId).length || 0;
    });
    return count;
  }

  getCustomerAgent(customerId: string): string | null {
    // Get the agent assigned to this customer from the users data
    let agentName = '';
    this.users$.subscribe(users => {
      const customer = users?.find(u => u._id === customerId);
      if (customer && customer.assignedAgentId) {
        this.agents$.subscribe(agents => {
          const agent = agents?.find(a => a._id === customer.assignedAgentId);
          agentName = agent?.name || '';
        });
      }
    });
    return agentName || null;
  }

  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
  }

  selectAgent(agent: any) {
    this.selectedAgent = agent;
  }


  assignAgentToCustomer() {
    if (this.selectedCustomer && this.selectedAgent) {
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      const apiUrl = 'http://localhost:4000/api/v1';
      
      const requestBody = {
        customerId: this.selectedCustomer._id,
        agentId: this.selectedAgent._id
      };
      
      
      // Call backend API to assign agent to customer
      this.http.post(`${apiUrl}/admin/assign-agent`, requestBody, { headers }).subscribe({
        next: (response: any) => {
          // Show success message
          alert(`Agent ${this.selectedAgent.name} has been assigned to customer ${this.selectedCustomer.name}`);
          
          // Reload users to get updated data
          this.store.dispatch(UserActions.loadUsers());
          
          // Reset selections
          this.selectedCustomer = null;
          this.selectedAgent = null;
        },
        error: (error) => {
          console.error('Error assigning agent:', error);
          console.error('Error details:', error.error);
          alert(`Failed to assign agent: ${error.error?.message || 'Please try again.'}`);
        }
      });
    } else {
    }
  }
}
