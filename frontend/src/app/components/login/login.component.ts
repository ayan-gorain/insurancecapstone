import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectLoading, selectError, selectUser } from '../../store/auth/auth.selectors';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  showPassword: boolean = false;
  
  // Observable properties for state management
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  user$: Observable<any | null>;

  constructor(private fb: FormBuilder, private store: Store) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Initialize observables
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit() {
    // Reset form to ensure clean state
    this.resetForm();
  }

  resetForm() {
    this.form.reset();
    this.showPassword = false;
  }

  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.store.dispatch(AuthActions.login({ email: email!, password: password! }));
    }
  }

  // Clear error when user starts typing
  onInputChange(): void {
    // Dispatch a clear error action if needed
    // For now, the error will be cleared when a new action is dispatched
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
