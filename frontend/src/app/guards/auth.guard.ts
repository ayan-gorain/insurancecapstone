import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take, filter, switchMap } from 'rxjs';
import { selectUser, selectAuthInitialized } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Wait for auth initialization to complete
    return this.store.select(selectAuthInitialized).pipe(
      filter(initialized => initialized), // Wait until initialization is complete
      take(1),
      switchMap(() => this.store.select(selectUser)),
      take(1),
      map(user => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
