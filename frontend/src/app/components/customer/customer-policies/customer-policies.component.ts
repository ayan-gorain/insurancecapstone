import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, interval, Subscription } from 'rxjs';
import { 
  loadAvailablePolicies, 
  loadMyPolicies, 
  buyPolicy, 
  cancelPolicy
} from '../../../store/customer/customer.actions';
import { CustomerState } from '../../../store/customer/customer.state';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-customer-policies',
  templateUrl: 'customer-policies.component.html',
  styleUrls: ['customer-policies.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CustomerPoliciesComponent implements OnInit, OnDestroy {
  user$: Observable<any | null>;
  customerState$: Observable<CustomerState>;
  activeTab: 'available' | 'purchased' = 'available';
  
  // Auto-reload subscription
  private autoReloadSubscription?: Subscription;
  
  // Form data
  buyPolicyForm = {
    policyId: '',
    startDate: '',
    termMonths: 12,
    nominee: '',
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    upiId: ''
  };

  // Purchase animation state
  isProcessingPurchase = false;
  purchaseSuccess = false;
  purchaseError = false;
  errorMessage = '';
  processingStep = 0;
  progressPercentage = 0;
  currentPolicyId = '';
  
  // Cancel policy state
  cancellingPolicyId = '';

  // Helper method to get current payment details
  getCurrentPaymentDetails(): string {
    switch (this.buyPolicyForm.paymentMethod) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return this.buyPolicyForm.cardNumber;
      case 'PAYPAL':
        return this.buyPolicyForm.upiId;
      case 'CASH':
        return 'CASH_PAYMENT';
      default:
        return '';
    }
  }

  // Helper method to check if payment details are valid
  isPaymentDetailsValid(): boolean {
    switch (this.buyPolicyForm.paymentMethod) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return this.buyPolicyForm.cardNumber.trim().length >= 16;
      case 'PAYPAL':
        return this.buyPolicyForm.upiId.trim().length > 0 && this.buyPolicyForm.upiId.includes('@');
      default:
        return true;
    }
  }

  constructor(private store: Store<{ customer: CustomerState }>) {
    this.user$ = this.store.select(selectUser);
    this.customerState$ = this.store.select('customer');
    
  }

  ngOnInit(): void {
    // Check authentication status first
    this.checkAuthenticationStatus();
    
    this.loadAvailablePolicies();
    this.loadMyPolicies();
    
    // Set up auto-reload every 30 seconds
    this.startAutoReload();
    
    // Check if we need to create test policies
    setTimeout(() => {
      this.checkAndCreateTestPolicies();
    }, 2000);
  }

  // Check authentication status
  checkAuthenticationStatus(): void {
    const token = localStorage.getItem('token');
    console.log('Customer Policies - Token status:', token ? 'Present' : 'Missing');
    console.log('Customer Policies - Token value:', token ? token.substring(0, 20) + '...' : 'None');
    
    this.user$.subscribe(user => {
      console.log('Customer Policies - User state:', user);
    });

    // Direct API test to bypass NgRx
    this.testDirectApiCall();
  }

  // Test direct API call to see if the issue is with NgRx or the API
  testDirectApiCall(): void {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Customer Policies - Testing direct API call...');
    fetch('http://localhost:4000/api/v1/customer/policies', { headers })
      .then(response => {
        console.log('Customer Policies - Direct API response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Customer Policies - Direct API response data:', data);
        console.log('Customer Policies - Direct API data type:', typeof data);
        console.log('Customer Policies - Direct API is array:', Array.isArray(data));
        console.log('Customer Policies - Direct API data length:', data?.length || 'N/A');
      })
      .catch(error => {
        console.error('Customer Policies - Direct API error:', error);
      });
  }

  // Check if policies exist and create test ones if needed
  checkAndCreateTestPolicies(): void {
    let availablePolicies: any[] = [];
    
    const stateSubscription = this.customerState$.subscribe(state => {
      availablePolicies = state.availablePolicies || [];
    });
    stateSubscription.unsubscribe();
    
    console.log('Available policies count:', availablePolicies.length);
  }


  ngOnDestroy(): void {
    // Clean up auto-reload subscription
    if (this.autoReloadSubscription) {
      this.autoReloadSubscription.unsubscribe();
    }
  }

  // Start auto-reload functionality
  private startAutoReload(): void {
    // Reload policies every 30 seconds
    this.autoReloadSubscription = interval(30000).subscribe(() => {
      this.loadAvailablePolicies();
      this.loadMyPolicies();
    });
  }

  // Load available policies
  loadAvailablePolicies(): void {
    this.store.dispatch(loadAvailablePolicies());
  }

  forceReloadPolicies(): void {
    this.loadAvailablePolicies();
    
  }

  // Load my policies
  loadMyPolicies(): void {
    this.store.dispatch(loadMyPolicies());
  }


  // Buy policy with simple animation
  async buyPolicy(policyId: string): Promise<void> {
    
    if (!this.buyPolicyForm.startDate || !this.buyPolicyForm.nominee || !this.buyPolicyForm.paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.isPaymentDetailsValid()) {
      alert('Please provide valid payment details');
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

    // Start processing animation
    this.isProcessingPurchase = true;
    this.purchaseSuccess = false;
    this.purchaseError = false;
    this.errorMessage = '';
    this.processingStep = 0;
    this.progressPercentage = 0;
    this.currentPolicyId = policyId;
    
    // Close the buy policy form modal
    this.buyPolicyForm.policyId = '';

    // Start realistic step-by-step progress
    this.simulateProcessingSteps();

    // Ensure policies are loaded before proceeding
    await this.ensurePoliciesLoaded();

    // Find the selected policy by subscribing to state
    let selectedPolicy: any = null;
    let availablePolicies: any[] = [];
    
    const stateSubscription = this.customerState$.subscribe(state => {
      availablePolicies = state.availablePolicies || [];
      selectedPolicy = availablePolicies.find((policy: any) => 
        policy._id === policyId || 
        policy.id === policyId ||
        policy._id?.toString() === policyId?.toString() ||
        policy.id?.toString() === policyId?.toString()
      );
    });
    stateSubscription.unsubscribe();

    if (!selectedPolicy) {
      console.error('Policy not found. Available policy IDs:', availablePolicies.map((p: any) => p._id || p.id));
      this.isProcessingPurchase = false;
      alert(`Policy not found. Please refresh the page and try again.`);
      return;
    }

    // Complete processing after realistic delay
    setTimeout(() => {
      this.proceedWithPurchase(policyId, selectedPolicy);
    }, 3000); // 3 second realistic animation
  }

  // Simulate realistic processing steps
  private simulateProcessingSteps(): void {
    const steps = [
      { step: 1, progress: 25, delay: 800, message: 'Validating Policy Details' },
      { step: 2, progress: 50, delay: 1200, message: 'Processing Payment' },
      { step: 3, progress: 75, delay: 1000, message: 'Activating Policy' },
      { step: 4, progress: 100, delay: 500, message: 'Finalizing Purchase' }
    ];

    let currentStep = 0;
    
    const processStep = () => {
      if (currentStep < steps.length) {
        const stepData = steps[currentStep];
        // Add some randomness to make it feel more realistic
        const randomDelay = stepData.delay + Math.random() * 200 - 100;
        setTimeout(() => {
          this.processingStep = stepData.step;
          this.progressPercentage = stepData.progress;
          currentStep++;
          processStep();
        }, Math.max(300, randomDelay)); // Minimum 300ms delay
      }
    };

    processStep();
  }

  // Helper method to proceed with purchase
  private proceedWithPurchase(policyId: string, selectedPolicy: any): void {
    // Dispatch the buy policy action with the form data
    const body = {
      startDate: this.buyPolicyForm.startDate,
      termMonths: this.buyPolicyForm.termMonths,
      nominee: this.buyPolicyForm.nominee,
      paymentMethod: this.buyPolicyForm.paymentMethod
    };

    this.store.dispatch(buyPolicy({ policyId: policyId, body }));
    
    // Simulate random success/failure for demo purposes
    // In real app, this would be handled by the store effects
    const isSuccess = Math.random() > 0.2; // 80% success rate for demo
    
    if (isSuccess) {
      // Show success animation
      this.purchaseSuccess = true;
      this.purchaseError = false;
      this.isProcessingPurchase = false;
      
      // Reload policies to show updated list
      this.loadMyPolicies();
      
      // Auto-switch to purchased policies tab after success
      setTimeout(() => {
        this.activeTab = 'purchased';
      }, 2000);
      
      // Reset form after a delay
      setTimeout(() => {
        this.resetAnimationState();
      }, 5000);
    } else {
      // Show error animation
      this.purchaseError = true;
      this.purchaseSuccess = false;
      this.isProcessingPurchase = false;
      this.errorMessage = 'Payment processing failed. Please check your payment details and try again.';
    }
  }


  // Ensure policies are loaded before proceeding
  async ensurePoliciesLoaded(): Promise<void> {
    return new Promise((resolve) => {
      // First, try to get current policies
      let currentPolicies: any[] = [];
      const subscription = this.customerState$.subscribe(state => {
        currentPolicies = state.availablePolicies || [];
      });
      subscription.unsubscribe();
      
      if (currentPolicies.length > 0) {
        console.log('Policies already loaded:', currentPolicies.length);
        resolve();
        return;
      }
      
      console.log('Policies not loaded, loading now...');
      this.loadAvailablePolicies();
      
      // Wait for policies to load by subscribing to state changes
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds total
      
      const checkSubscription = this.customerState$.subscribe(state => {
        attempts++;
        const policies = state.availablePolicies || [];
        console.log(`Checking for policies (attempt ${attempts}/${maxAttempts}):`, policies.length);
        
        if (policies.length > 0) {
          console.log('Policies loaded successfully:', policies.length);
          checkSubscription.unsubscribe();
          resolve();
        } else if (attempts >= maxAttempts) {
          console.warn('Timeout waiting for policies to load');
          checkSubscription.unsubscribe();
          resolve();
        }
      });
    });
  }

  // Find and process the policy
  findAndProcessPolicy(policyId: string): void {
    let availablePolicies: any[] = [];
    let selectedPolicy: any = null;
    
    const stateSubscription = this.customerState$.subscribe(state => {
      availablePolicies = state.availablePolicies || [];
      selectedPolicy = availablePolicies.find((policy: any) => 
        policy._id === policyId || 
        policy.id === policyId ||
        policy._id?.toString() === policyId?.toString()
      );
    });
    stateSubscription.unsubscribe();
    
    if (!selectedPolicy) {
      alert(`Policy not found. Available policies: ${availablePolicies.length}. Please refresh the page and try again.`);
      return;
    }
  }


  // Cancel policy
  cancelPolicy(policyId: string): void {
    if (confirm('Are you sure you want to cancel this policy? This action cannot be undone.')) {
      // Set loading state
      this.cancellingPolicyId = policyId;
      
      // Dispatch the cancel action
      this.store.dispatch(cancelPolicy({ policyId }));
      
      // Refresh the policies list after a short delay to show updated status
      setTimeout(() => {
        this.loadMyPolicies();
        this.loadAvailablePolicies(); // Also refresh available policies in case it becomes available again
        
        // Clear loading state
        this.cancellingPolicyId = '';
        
        // Show a brief success message
        this.showCancelSuccessMessage();
      }, 1000);
    }
  }

  // Show cancel success message
  private showCancelSuccessMessage(): void {
    // Create a temporary success message
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    message.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Policy cancelled successfully!</span>
      </div>
    `;
    
    document.body.appendChild(message);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(message)) {
          document.body.removeChild(message);
        }
      }, 300);
    }, 3000);
  }

  // Set policy for purchase
  setPolicyForPurchase(policyId: string): void {
    console.log('Setting policy for purchase:', policyId);
    this.buyPolicyForm.policyId = policyId;
    
    // Ensure policies are loaded when setting policy for purchase
    this.ensurePoliciesLoaded().then(() => {
      let availablePolicies: any[] = [];
      let policy: any = null;
      
      const stateSubscription = this.customerState$.subscribe(state => {
        availablePolicies = state.availablePolicies || [];
        policy = availablePolicies.find((p: any) => p._id === policyId || p.id === policyId);
      });
      stateSubscription.unsubscribe();
      
      if (policy) {
        console.log('Policy found and ready for purchase:', policy.title);
      } else {
        console.warn('Policy not found in available policies after loading');
      }
    });
  }


  // Switch tabs
  switchTab(tab: 'available' | 'purchased'): void {
    this.activeTab = tab;
  }

  // Check if user can buy policies (not admin)
  canBuyPolicies(user: any): boolean {
    return user && user.role !== 'admin';
  }

  // Check if user can buy a specific policy (not already purchased)
  canBuySpecificPolicy(policyId: string): boolean {
    let myPolicies: any[] = [];
    
    const stateSubscription = this.customerState$.subscribe(state => {
      myPolicies = state.myPolicies || [];
    });
    stateSubscription.unsubscribe();
    
    return !myPolicies.some((myPolicy: any) => 
      myPolicy.policyProductId?._id === policyId && 
      (myPolicy.status === 'ACTIVE' || myPolicy.status === 'PENDING')
    );
  }

  // Track by function for ngFor performance
  trackByPolicyId(index: number, policy: any): string {
    return policy._id || index.toString();
  }

  // Handle image loading errors
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
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-sm">Image Error</p>
        </div>
      `;
    }
  }

  // Handle successful image loading
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

  // Get status class for styling
  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'text-green-600 font-semibold';
      case 'PENDING':
        return 'text-yellow-600 font-semibold';
      case 'CANCELLED':
        return 'text-red-600 font-semibold';
      case 'EXPIRED':
        return 'text-gray-600 font-semibold';
      default:
        return 'text-gray-500';
    }
  }

  // Get assigned agent display text
  getAssignedAgentText(policy: any): string {
    // For available policies
    if (policy.assignedAgent) {
      return policy.assignedAgent.name || 'Assigned Agent';
    }
    
    // For purchased policies
    if (policy.userId?.assignedAgentId) {
      return policy.userId.assignedAgentId.name || 'Assigned Agent';
    }
    
    return 'Not Assigned Client';
  }

  // Get assigned agent class for styling
  getAssignedAgentClass(policy: any): string {
    const hasAgent = policy.assignedAgent || policy.userId?.assignedAgentId;
    return hasAgent ? 'text-green-600 font-medium' : 'text-orange-500 font-medium';
  }

  // Retry purchase
  retryPurchase(): void {
    if (this.currentPolicyId) {
      this.buyPolicy(this.currentPolicyId);
    }
  }

  // Close modal and reset
  closeModal(): void {
    this.resetAnimationState();
  }

  // Reset animation state
  resetAnimationState(): void {
    this.isProcessingPurchase = false;
    this.purchaseSuccess = false;
    this.purchaseError = false;
    this.errorMessage = '';
    this.processingStep = 0;
    this.progressPercentage = 0;
    this.currentPolicyId = '';
    this.buyPolicyForm = {
      policyId: '',
      startDate: '',
      termMonths: 12,
      nominee: '',
      paymentMethod: 'CREDIT_CARD',
      cardNumber: '',
      upiId: ''
    };
  }

}
