import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { selectUser } from '../../../store/auth/auth.selectors';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  user$: Observable<any | null>;
  isRouteActive: boolean = false;

  constructor(private store: Store, private router: Router) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Check if any child route is active
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isRouteActive = event.url !== '/admin';
      });
    
    // Initial check
    this.isRouteActive = this.router.url !== '/admin';
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
