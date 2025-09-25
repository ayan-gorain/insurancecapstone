import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectUser } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const expectedRole = route.data['role'];
    
    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        
        if (user.role === expectedRole) {
          return true;
        }
        
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'agent':
            this.router.navigate(['/agent']);
            break;
          case 'customer':
            this.router.navigate(['/customer']);
            break;
          default:
            this.router.navigate(['/login']);
        }
        
        return false;
      })
    );
  }
}
