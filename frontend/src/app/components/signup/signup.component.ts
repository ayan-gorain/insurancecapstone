import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectLoading, selectError, selectUser } from '../../store/auth/auth.selectors';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule]
})
export class SignupComponent implements OnInit {
  form: FormGroup;
  photoName: string | null = null;
  photoPreview: string | ArrayBuffer | null = null; // For showing preview
  photoBase64: string | null = null; // For sending to backend
  showPassword: boolean = false;
  
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  user$: Observable<any | null>;

  constructor(private fb: FormBuilder, private store: Store) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
     
    });

 
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit() {
    
    this.resetForm();
  }

  resetForm() {
    this.form.reset();
    this.photoName = null;
    this.photoPreview = null;
    this.photoBase64 = null;
    this.showPassword = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.photoName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result; 
        this.photoBase64 = reader.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { name, email, password } = this.form.value;

      this.store.dispatch(
        AuthActions.signup({
          name,
          email,
          password,
          role: 'customer', 
          photo: this.photoBase64 || undefined
        })
      );
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
