import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectUser } from '../../../store/auth/auth.selectors';
import { selectAllUsers } from '../../../store/user/user.selectors';
import * as AuthActions from '../../../store/auth/auth.actions';
import * as UserActions from '../../../store/user/user.action';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AgentDashboardComponent implements OnInit {
  user$: Observable<any | null>;
  users$: Observable<any[]>;
  assignedCustomers: any[] = [];

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
    this.users$ = this.store.select(selectAllUsers);
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
    
    // Get assigned customers for the current agent
    this.user$.subscribe(user => {
      if (user && user.role === 'agent') {
        this.users$.subscribe(users => {
          // Show only customers assigned to this agent
          this.assignedCustomers = users?.filter(u => u.role === 'customer' && u.assignedAgentId === user._id) || [];
        });
      }
    });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  onImageError(event: any): void {
    // Hide the image and show the fallback initial
    event.target.style.display = 'none';
    const fallback = event.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }
}
