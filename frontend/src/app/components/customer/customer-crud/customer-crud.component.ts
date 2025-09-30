import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  loadAvailablePolicies, 
  loadMyPolicies, 
  buyPolicy, 
  cancelPolicy 
} from '../../../store/customer/customer.actions';
import { CustomerState } from '../../../store/customer/customer.state';

@Component({
  selector: 'app-customer-crud',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-crud.component.html',
  styleUrl: './customer-crud.component.css'
})
export class CustomerCrud implements OnInit {
  
  // Observables
  customerState$: Observable<CustomerState>;
  
  // Form data
  buyPolicyForm = {
    policyId: '',
    startDate: '',
    termMonths: 12,
    nominee: ''
  };

  constructor(private store: Store<{ customer: CustomerState }>) {
    this.customerState$ = this.store.select('customer');
  }

  ngOnInit(): void {
    this.loadAvailablePolicies();
    this.loadMyPolicies();
  }

  // Load available policies
  loadAvailablePolicies(): void {
    this.store.dispatch(loadAvailablePolicies());
  }

  // Load my policies
  loadMyPolicies(): void {
    this.store.dispatch(loadMyPolicies());
  }

  // Buy policy
  buyPolicy(policyId: string): void {
    if (!this.buyPolicyForm.startDate || !this.buyPolicyForm.nominee) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate start date is not in the past
    const startDate = new Date(this.buyPolicyForm.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      alert('Start date cannot be in the past');
      return;
    }

    // Dispatch the buy policy action directly
    const body = {
      startDate: this.buyPolicyForm.startDate,
      termMonths: this.buyPolicyForm.termMonths,
      nominee: this.buyPolicyForm.nominee
    };

    this.store.dispatch(buyPolicy({ policyId, body }));
    
    // Reset form
    this.buyPolicyForm = {
      policyId: '',
      startDate: '',
      termMonths: 12,
      nominee: ''
    };
  }


  // Cancel policy
  cancelPolicy(policyId: string): void {
    if (confirm('Are you sure you want to cancel this policy?')) {
      this.store.dispatch(cancelPolicy({ policyId }));
    }
  }

  // Set policy for purchase
  setPolicyForPurchase(policyId: string): void {
    this.buyPolicyForm.policyId = policyId;
  }

  onImageError(event: any): void {
    // Hide the image and show the fallback initial
    event.target.style.display = 'none';
    const fallback = event.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }
}
