import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as PolicyActions from '../../../store/policy/policy.actions';
import { selectPolicyLoading, selectPolicyError, selectCreatedPolicy } from '../../../store/policy/policy.selectors';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-policy',
  templateUrl: './admin-policy.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class AdminPolicyComponent {
  form: FormGroup;
  imageName: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageBase64: string | null = null;
  
  // Observable properties for state management
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  createdPolicy$: Observable<any | null>;

  constructor(private fb: FormBuilder, private store: Store) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      premium: ['', [Validators.required, Validators.min(1)]],
      termMonths: ['', [Validators.required, Validators.min(1)]],
      minSumInsured: ['', [Validators.required, Validators.min(1000)]],
    });

    // Initialize observables
    this.loading$ = this.store.select(selectPolicyLoading);
    this.error$ = this.store.select(selectPolicyError);
    this.createdPolicy$ = this.store.select(selectCreatedPolicy);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.store.dispatch(PolicyActions.createPolicyFailure({ 
          error: 'Please select a valid image file' 
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.store.dispatch(PolicyActions.createPolicyFailure({ 
          error: 'Image size should be less than 5MB' 
        }));
        return;
      }

      this.imageName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.imageBase64) {
      const { code, title, description, premium, termMonths, minSumInsured } = this.form.value;

      this.store.dispatch(
        PolicyActions.createPolicy({
          code,
          title,
          description,
          premium: Number(premium),
          termMonths: Number(termMonths),
          minSumInsured: Number(minSumInsured),
          image: this.imageBase64
        })
      );
    } else if (!this.imageBase64) {
      this.store.dispatch(PolicyActions.createPolicyFailure({ 
        error: 'Please select an image for the policy' 
      }));
    }
  }

  onInputChange(): void {
    // Clear error when user starts typing
    this.store.dispatch(PolicyActions.clearPolicyState());
  }

  resetForm(): void {
    this.form.reset();
    this.imageName = null;
    this.imagePreview = null;
    this.imageBase64 = null;
    this.store.dispatch(PolicyActions.clearPolicyState());
  }
}
