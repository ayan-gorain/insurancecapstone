import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';
import * as AgentActions from '../../../store/agent/agent.actions';
import * as AgentSelectors from '../../../store/agent/agent.selectors';

@Component({
  selector: 'app-agent-dashbaord',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './agent-dashbaord.html',
  styleUrl: './agent-dashbaord.css'
})
export class AgentDashbaord implements OnInit {
  user$: Observable<any | null>;

  constructor(
    private store: Store<{ auth: any; agent: any }>,
    public router: Router
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Debug user information
    this.user$.subscribe(user => {
      console.log('Agent Dashboard - Current user:', user);
      if (user) {
        console.log('Agent Dashboard - User role:', user.role);
        console.log('Agent Dashboard - User ID:', user._id);
      } else {
        console.log('Agent Dashboard - No user found');
      }
    });

    // Load initial data
    this.store.dispatch(AgentActions.loadCustomers());
    this.store.dispatch(AgentActions.loadClaims());
    this.store.dispatch(AgentActions.loadPendingClaims());
    this.store.dispatch(AgentActions.loadClaimStats());
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  logout(): void {
    this.store.dispatch(logout());
  }
}
