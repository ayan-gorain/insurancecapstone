import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CustomerPolicy {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
  
  getAvailablePolicies(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    return this.http.get(`${this.baseUrl}/customer/policies`, { headers });
  }  
  
  getMyPolicies(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.baseUrl}/customer/my-policies`, { headers });
  }
  
  buyPolicy(policyId: string, body: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.post(`${this.baseUrl}/customer/policies/${policyId}/purchase`, body, { headers });
  }
  
  cancelPolicy(policyId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.put(`${this.baseUrl}/customer/my-policies/${policyId}/cancel`, {}, { headers });
  }

  // Claim methods
  submitClaim(claimData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.post(`${this.baseUrl}/customer/claims`, claimData, { headers });
  }

  submitClaimWithoutPolicy(claimData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.post(`${this.baseUrl}/customer/claims/without-policy`, claimData, { headers });
  }

  getMyClaims(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.baseUrl}/customer/claims`, { headers });
  }

  getClaimDetails(claimId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.baseUrl}/customer/claims/${claimId}`, { headers });
  }

  getClaimStats(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.baseUrl}/customer/claims-stats`, { headers });
  }

  checkAgentAssignment(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.baseUrl}/customer/agent-assignment`, { headers });
  }

}
