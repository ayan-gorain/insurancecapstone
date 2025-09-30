import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import * as PolicyActions from '../../../store/policy/policy.actions';
import { selectPolicyLoading, selectPolicyError, selectPolicies } from '../../../store/policy/policy.selectors';
import { CustomerPolicy } from '../../../services/customer-policy';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-admin-policy-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-policy-list.component.html',
  styleUrl: './admin-policy-list.component.css'
})
export class AdminPolicyList implements OnInit{

  policies$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  user$: Observable<any | null>;

  // Buy policy form
  buyPolicyForm = {
    policyId: '',
    startDate: '',
    termMonths: 12,
    nominee: ''
  };

  constructor(private store: Store, private actions$: Actions, private customerPolicy: CustomerPolicy) {
    this.policies$ = this.store.select(selectPolicies);
    this.loading$ = this.store.select(selectPolicyLoading);
    this.error$ = this.store.select(selectPolicyError);
    this.user$ = this.store.select(selectUser);
  }
  editingPolicy:any|null=null;

  ngOnInit(): void {
    this.store.dispatch(PolicyActions.loadPolicies());
    
    // Listen for successful policy updates and deletes, then reload the list
    this.actions$.pipe(
      ofType(PolicyActions.updatePolicySuccess, PolicyActions.deletePolicySuccess)
    ).subscribe(() => {
      this.store.dispatch(PolicyActions.loadPolicies());
    });
  }

  deletePolicy(policyId:string){
    if(confirm('Are you sure you want to delete this policy?')){
      this.store.dispatch(PolicyActions.deletePolicy({policyId}));
    }

  }
  startEdit(policy: any){
    this.editingPolicy={...policy};
  }

  saveEdit(){
    if(this.editingPolicy){
      this.store.dispatch(PolicyActions.updatePolicy({policyId:this.editingPolicy._id,policyData:this.editingPolicy}));
      this.editingPolicy=null;
    }
  }
  cancelEdit(){
    this.editingPolicy=null;
  }

  // Buy policy methods
  setPolicyForPurchase(policyId: string): void {
    this.buyPolicyForm.policyId = policyId;
  }

  buyPolicy(policyId: string): void {
    if (!this.buyPolicyForm.startDate || !this.buyPolicyForm.nominee) {
      alert('Please fill in all required fields');
      return;
    }

    const body = {
      startDate: this.buyPolicyForm.startDate,
      termMonths: this.buyPolicyForm.termMonths,
      nominee: this.buyPolicyForm.nominee
    };

    this.customerPolicy.buyPolicy(policyId, body).subscribe({
      next: (response) => {
        alert('Policy purchased successfully!');
        this.buyPolicyForm.policyId = '';
        this.resetBuyPolicyForm();
      },
      error: (error) => {
        console.error('Error buying policy:', error);
        alert('Error purchasing policy. Please try again.');
      }
    });
  }

  resetBuyPolicyForm(): void {
    this.buyPolicyForm = {
      policyId: '',
      startDate: '',
      termMonths: 12,
      nominee: '',
    };
  }

  onImageError(event: any): void {
    
    const img = event.target;
    const currentSrc = img.src;
    const policyTitle = img.getAttribute('alt') || '';
    
    // Check if this is already a fallback image
    const isFallback = currentSrc.includes('unsplash.com');
    
    if (!isFallback) {
      // This is the original image, try fallback
      const fallbackUrl = this.getFallbackImageUrl(policyTitle);
      img.src = fallbackUrl;
      return;
    }
    
    // Both original and fallback failed, show error placeholder
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="text-gray-400 text-center">
          <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-sm">Image Error</p>
        </div>
      `;
    }
  }

  onImageLoad(event: any): void {
  }

  // Get the appropriate image URL with fallback
  getImageUrl(originalUrl: string, policyTitle: string): string {
    // If we have an original URL, use it
    if (originalUrl && originalUrl.trim() !== '') {
      return originalUrl;
    }
    
    // Otherwise, return fallback based on policy type
    return this.getFallbackImageUrl(policyTitle);
  }

  // Get fallback image URL
  getFallbackImageUrl(policyTitle: string): string {
    // Return a placeholder image based on policy type
    const title = policyTitle?.toLowerCase() || '';
    if (title.includes('engine')) {
      return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop';
    } else if (title.includes('comprehensive')) {
      return 'https://images.unsplash.com/photo-1558618047-7c4a7c3e5b3b?w=400&h=300&fit=crop';
    } else if (title.includes('liability')) {
      return 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop';
    } else if (title.includes('depreciation')) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
    } else if (title.includes('zero')) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
    } else if (title.includes('third')) {
      return 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop';
    } else {
      return 'https://images.unsplash.com/photo-1558618047-7c4a7c3e5b3b?w=400&h=300&fit=crop';
    }
  }

  updateImage(policy: any): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Validate file type - allow all image formats
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
          'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif'
        ];
        
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          alert('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, AVIF)');
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const imageBase64 = reader.result as string;
          // Update the policy with the new image
          this.store.dispatch(PolicyActions.updatePolicy({
            policyId: policy._id,
            policyData: { image: imageBase64 }
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
}
