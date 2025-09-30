import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectError, selectLoading } from '../../../store/auth/auth.selectors';
import * as UserActions from '../../../store/user/user.action';
import { selectAllAgents, selectUserLoading, selectUserError, selectCreatedAgent } from '../../../store/user/user.selectors';

@Component({
  selector: 'app-create-agent',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-agent.component.html',
  styleUrl: './create-agent.component.css'
})
export class CreateAgent implements OnInit {
  agentForm: any;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  createdAgent$: Observable<any>;
  showPassword = false;
  photoPreview: string | null = null;
  photoName: string | null = null;

  constructor(private fb: FormBuilder, private store: Store) {
    this.loading$ = this.store.select(selectUserLoading);
    this.error$ = this.store.select(selectUserError);
    this.createdAgent$ = this.store.select(selectCreatedAgent);
  }

  ngOnInit() {
    this.agentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', Validators.required],
      photo: ['']
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.photoName = file.name;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
        // Update form control with base64 or file data
        this.agentForm.patchValue({ photo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.agentForm.valid) {
      const formValue = this.agentForm.value;
      this.store.dispatch(UserActions.createAgent({
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        role: 'agent', // Set default role
        address: formValue.address,
        photo: formValue.photo || ''
      }));
    }
  }

  onReset() {
    this.agentForm.reset();
    this.photoPreview = null;
    this.photoName = null;
    this.showPassword = false;
    this.store.dispatch(UserActions.clearCreateAgent());
  }
}
