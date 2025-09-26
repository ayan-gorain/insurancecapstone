import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { 
  loadMyClaims,
  loadClaimStats,
  submitClaim
} from '../../../store/customer/customer.actions';
import { CustomerState } from '../../../store/customer/customer.state';

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
  
  // Claim form
  claimForm: FormGroup;

  constructor(
    private store: Store<{ customer: CustomerState }>,
    private fb: FormBuilder
  ) {
    this.customerState$ = this.store.select('customer');
    
    // Initialize claim form
    this.claimForm = this.fb.group({
      userPolicyId: ['', Validators.required],
      incidentDate: ['', Validators.required],
      incidentLocation: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadMyClaims();
    this.loadClaimStats();
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

        this.store.dispatch(submitClaim({ claimData }));
        
        // Reset form after submission
        this.resetClaimForm();
        this.showClaimForm = false;
        
        // Reload claims to show the new one
        this.loadMyClaims();
        this.loadClaimStats();
      });
    }
  }

  resetClaimForm(): void {
    this.claimForm.reset();
    this.claimImages = [];
  }
}