import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AgentActions from '../../../store/agent/agent.actions';
import * as AgentSelectors from '../../../store/agent/agent.selectors';

@Component({
  selector: 'app-pending-claims',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-claims.html',
  styleUrl: './pending-claims.css'
})
export class PendingClaims implements OnInit {
  claims$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  selectedClaim$: Observable<any>;
  
  // Quick review form
  quickReviewForm = {
    status: 'APPROVED',
    comments: ''
  };

  constructor(private store: Store<{ agent: any }>) {
    this.claims$ = this.store.select(AgentSelectors.selectPendingClaims);
    this.loading$ = this.store.select(AgentSelectors.selectLoading);
    this.error$ = this.store.select(AgentSelectors.selectError);
    this.selectedClaim$ = this.store.select(AgentSelectors.selectSelectedClaim);
    
    // Debug customers
    this.store.select(AgentSelectors.selectCustomers).subscribe(customers => {
      console.log('Pending Claims - Assigned customers:', customers);
      console.log('Pending Claims - Customer count:', customers ? customers.length : 'null');
    });
  }

  ngOnInit(): void {
    console.log('Pending Claims - Component initialized');
    
    // Debug loading and error states
    this.loading$.subscribe(loading => {
      console.log('Pending Claims - Loading state:', loading);
    });
    
    this.error$.subscribe(error => {
      console.log('Pending Claims - Error state:', error);
    });
    
    // Debug claims data
    this.claims$.subscribe(claims => {
      console.log('Pending Claims - Claims loaded:', claims);
      console.log('Pending Claims - Claims count:', claims ? claims.length : 'null');
      if (claims && claims.length > 0) {
        console.log('Pending Claims - First claim ID:', claims[0]._id);
        console.log('Pending Claims - First claim status:', claims[0].status);
      } else {
        console.log('Pending Claims - No claims found or claims is null');
      }
    });
    
    console.log('Pending Claims - Dispatching loadPendingClaims action');
    this.store.dispatch(AgentActions.loadPendingClaims());
    
    // Also load customers to check if agent has assigned customers
    console.log('Pending Claims - Also loading customers to check assignments');
    this.store.dispatch(AgentActions.loadCustomers());
  }

  selectClaim(claim: any): void {
    this.store.dispatch(AgentActions.selectClaim({ claim }));
    this.quickReviewForm = {
      status: 'APPROVED', // Always default to APPROVED
      comments: claim.decisionNotes || ''
    };
  }

  quickApprove(claimId: string): void {
    console.log('Pending Claims - Quick Approve button clicked!');
    console.log('Pending Claims - Quick Approve - Claim ID:', claimId);
    
    // Add alert for testing
    alert('Quick Approve button clicked for claim: ' + claimId);
    
    if (!claimId) {
      console.error('Pending Claims - Quick Approve - No claim ID provided');
      return;
    }
    
    const reviewData = {
      status: 'APPROVED',
      notes: 'Approved by agent',
      approvedAmount: null
    };
    console.log('Pending Claims - Quick Approve - Review Data:', reviewData);
    this.store.dispatch(AgentActions.reviewClaim({ claimId, reviewData }));
  }

  quickReject(claimId: string): void {
    console.log('Pending Claims - Quick Reject button clicked!');
    console.log('Pending Claims - Quick Reject - Claim ID:', claimId);
    
    // Add alert for testing
    alert('Quick Reject button clicked for claim: ' + claimId);
    
    if (!claimId) {
      console.error('Pending Claims - Quick Reject - No claim ID provided');
      return;
    }
    
    const reviewData = {
      status: 'REJECTED',
      notes: 'Rejected by agent',
      approvedAmount: null
    };
    console.log('Pending Claims - Quick Reject - Review Data:', reviewData);
    this.store.dispatch(AgentActions.reviewClaim({ claimId, reviewData }));
  }

  submitQuickReview(claimId: string): void {
    const reviewData = {
      status: this.quickReviewForm.status,
      notes: this.quickReviewForm.comments,
      approvedAmount: null
    };
    console.log('Pending Claims - Submit Review - Claim ID:', claimId);
    console.log('Pending Claims - Submit Review - Review Data:', reviewData);
    this.store.dispatch(AgentActions.reviewClaim({ claimId, reviewData }));
    this.quickReviewForm = { status: 'APPROVED', comments: '' };
  }

  clearSelection(): void {
    this.store.dispatch(AgentActions.clearSelectedClaim());
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-orange-600 bg-orange-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getDaysSinceSubmission(date: string): number {
    const submissionDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - submissionDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  openPhotoModal(photoUrl: string, event: Event): void {
    event.stopPropagation();
    // Create a modal to display the full-size photo
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="relative max-w-4xl max-h-full p-4">
        <button class="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300 z-10" onclick="this.parentElement.parentElement.remove()">×</button>
        <img src="${photoUrl}" alt="Claim photo" class="max-w-full max-h-full object-contain rounded-lg">
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}
