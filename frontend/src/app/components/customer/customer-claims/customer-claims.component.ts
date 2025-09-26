import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { 
  loadMyClaims,
  loadClaimStats,
  submitClaim,
  submitClaimWithoutPolicy,
  submitClaimSuccess,
  submitClaimWithoutPolicySuccess
} from '../../../store/customer/customer.actions';
import { CustomerState } from '../../../store/customer/customer.state';
import { CustomerPolicy } from '../../../services/customer-policy';

@Component({
  selector: 'app-customer-claims',
  templateUrl: './customer-claims.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CustomerClaimsComponent implements OnInit {
  customerState$: Observable<CustomerState>;
  showClaimForm: boolean = false;
  claimImages: File[] = [];
  hasAssignedAgent: boolean = false;
  assignedAgent: any = null;
  
  // Claim form
  claimForm: FormGroup;

  constructor(
    private store: Store<{ customer: CustomerState }>,
    private fb: FormBuilder,
    private customerPolicy: CustomerPolicy,
    private actions$: Actions
  ) {
    this.customerState$ = this.store.select('customer');
    
    // Initialize claim form
    this.claimForm = this.fb.group({
      userPolicyId: [''], // Made optional
      incidentDate: ['', Validators.required],
      incidentLocation: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      policyType: ['GENERAL', Validators.required] // Added policy type field
    });

    // Listen for successful claim submissions
    this.actions$.pipe(
      ofType(submitClaimSuccess, submitClaimWithoutPolicySuccess)
    ).subscribe(() => {
      alert('Claim submitted successfully! Your claim has been sent for review.');
    });
  }

  ngOnInit(): void {
    this.loadMyClaims();
    this.loadClaimStats();
    this.checkAgentAssignment();
  }

  checkAgentAssignment(): void {
    this.customerPolicy.checkAgentAssignment().subscribe({
      next: (response) => {
        this.hasAssignedAgent = response.hasAssignedAgent;
        this.assignedAgent = response.assignedAgent;
      },
      error: (error) => {
        console.error('Error checking agent assignment:', error);
        this.hasAssignedAgent = false;
        this.assignedAgent = null;
      }
    });
  }

  // Load my claims
  loadMyClaims(): void {
    this.store.dispatch(loadMyClaims());
  }

  // Load claim stats
  loadClaimStats(): void {
    this.store.dispatch(loadClaimStats());
  }

  // Claim submission methods
  onClaimImagesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.claimImages = files;
  }

  submitClaim(): void {
    // Check if user has an assigned agent
    if (!this.hasAssignedAgent) {
      alert('You cannot submit claims until an agent is assigned to you. Please contact admin to get an agent assigned.');
      return;
    }

    if (this.claimForm.valid && this.claimImages.length >= 2) {
      const formData = this.claimForm.value;
      
      // Convert images to base64
      const imagePromises = this.claimImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises).then(images => {
        const claimData = {
          ...formData,
          images: images
        };

        // Check if user has a policy selected
        if (formData.userPolicyId && formData.userPolicyId.trim() !== '') {
          // Submit claim with policy
          this.store.dispatch(submitClaim({ claimData }));
        } else {
          // Submit claim without policy
          this.store.dispatch(submitClaimWithoutPolicy({ claimData }));
        }
        
        // Reset form after submission
        this.resetClaimForm();
        this.showClaimForm = false;
      });
    }
  }

  resetClaimForm(): void {
    this.claimForm.reset();
    this.claimImages = [];
  }
}