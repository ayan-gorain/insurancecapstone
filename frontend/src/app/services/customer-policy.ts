import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerPolicy {
  private baseUrl = `${environment.apiUrl}/api/v1`;
  
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
    return this.http.get(`${this.baseUrl}/customer/claims`);
  }

  getClaimDetails(claimId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/claims/${claimId}`);
  }

  getClaimStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/claims-stats`);
  }

  checkAgentAssignment(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/agent-assignment`);
  }

}
