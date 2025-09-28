import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CustomerPolicy {
  private baseUrl = environment.apiUrl;
  private claimsCache: any = null;
  private statsCache: any = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  
  constructor(private http: HttpClient) {}
  
  getAvailablePolicies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/policies`);
  }  
  
  getMyPolicies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/my-policies`);
  }
  
  buyPolicy(policyId: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/policies/${policyId}/purchase`, body);
  }
  
  cancelPolicy(policyId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/customer/my-policies/${policyId}/cancel`, {});
  }

  // Claim methods
  submitClaim(claimData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/claims`, claimData);
  }

  submitClaimWithoutPolicy(claimData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/claims/without-policy`, claimData);
  }

  getMyClaims(): Observable<any> {
    // Check cache first
    const now = Date.now();
    if (this.claimsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Customer Service - Returning cached claims');
      return new Observable(observer => {
        observer.next(this.claimsCache);
        observer.complete();
      });
    }
    
    return this.http.get(`${this.baseUrl}/customer/claims`).pipe(
      tap(claims => {
        this.claimsCache = claims;
        this.cacheTimestamp = now;
        console.log('Customer Service - Cached claims data');
      })
    );
  }

  getClaimDetails(claimId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/claims/${claimId}`);
  }

  getClaimStats(): Observable<any> {
    // Check cache first
    const now = Date.now();
    if (this.statsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Customer Service - Returning cached stats');
      return new Observable(observer => {
        observer.next(this.statsCache);
        observer.complete();
      });
    }
    
    return this.http.get(`${this.baseUrl}/customer/claims-stats`).pipe(
      tap(stats => {
        this.statsCache = stats;
        this.cacheTimestamp = now;
        console.log('Customer Service - Cached stats data');
      })
    );
  }

  checkAgentAssignment(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/agent-assignment`);
  }

  // Clear cache when new data is submitted
  clearCache(): void {
    this.claimsCache = null;
    this.statsCache = null;
    this.cacheTimestamp = 0;
    console.log('Customer Service - Cache cleared');
  }

  // sendTestEmail removed

}
