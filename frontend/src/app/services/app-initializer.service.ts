import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import * as AuthActions from '../store/auth/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private store = inject(Store<AppState>);

  initializeApp(): Promise<void> {
    return new Promise((resolve) => {
      // Dispatch the initialize auth action
      this.store.dispatch(AuthActions.initializeAuth());
      resolve();
    });
  }
}

export function initializeApp(appInitializer: AppInitializerService) {
  return () => appInitializer.initializeApp();
}
