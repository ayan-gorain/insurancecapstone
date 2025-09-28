import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as UserActions from './user.action';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(() => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });

        return this.http.get<any[]>(`${this.apiUrl}/admin/users`, { headers }).pipe(
          map((users) => UserActions.loadUsersSuccess({ users })),
          catchError((error) => of(UserActions.loadUsersFailure({ 
            error: error.error?.message || 'Failed to load users' 
          })))
        );
      })
    )
  );

  createAgent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createAgent),
      switchMap(({ name, email, password, role, address, photo }) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });

        return this.http.post<any>(`${this.apiUrl}/admin/agents`, { 
          name, 
          email, 
          password, 
          address, 
          photo 
        }, { headers }).pipe(
          map((agent) => UserActions.createAgentSuccess({ agent })),
          catchError((error) => of(UserActions.createAgentFailure({ 
            error: error.error?.message || 'Failed to create agent' 
          })))
        );
      })
    )
  );
}
