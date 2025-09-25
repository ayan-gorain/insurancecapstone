import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectUser } from '../../store/auth/auth.selectors';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  user$: Observable<any | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Load any initial data if needed
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
