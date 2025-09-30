import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectUser } from '../../../store/auth/auth.selectors';
import * as AuthActions from '../../../store/auth/auth.actions';
import { HttpClientModule } from '@angular/common/http';
import { CustomerPolicy } from '../../../services/customer-policy';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
})
export class CustomerDashboardComponent implements OnInit {
  user$: Observable<any | null>;

  constructor(
    private store: Store,
    public router: Router,
    private customerPolicy: CustomerPolicy,
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
  
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/login']);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
    const fallback = event.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }

}
