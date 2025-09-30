import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from './store';
import * as AuthActions from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('LifeShield - Advanced Insurance Protection');
  private store = inject(Store<AppState>);

  ngOnInit(): void {
    // Initialize authentication state when app starts
    this.store.dispatch(AuthActions.initializeAuth());
  }
}
