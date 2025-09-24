import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signup),
      mergeMap(({ name, email, password, role, photo }) =>
        this.authService.signup(name, email, password, role, photo).pipe(
          map((res: any) => {
            if (res.error) {
              return AuthActions.signupFailure({ error: res.error });
            }
            return AuthActions.signupSuccess({ user: res.user, token: res.token });
          }),
          catchError((error) => of(AuthActions.signupFailure({ error: error.message || 'Signup failed' })))
        )
      )
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((res: any) => {
            if (res.error) {
              return AuthActions.loginFailure({ error: res.error });
            }
            return AuthActions.loginSuccess({ user: res.user, token: res.token });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message || 'Login failed' })))
        )
      )
    )
  );

  redirectAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.signupSuccess),
        tap(({ user }) => {
          if (user.role === 'admin') this.router.navigate(['/admin']);
          else if (user.role === 'agent') this.router.navigate(['/agent']);
          else this.router.navigate(['/customer']);
        })
      ),
    { dispatch: false }
  );
}
