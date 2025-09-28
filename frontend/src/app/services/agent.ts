import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://localhost:4000/api/v1/agent';

  constructor(private http: HttpClient) { }

  // Profile Methods
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateMyProfile(profile: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profile);
  }

  // Customer Methods
  getMyCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`);
  }

  getCustomerPolicies(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${customerId}/policies`);
  }

  getCustomerClaims(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${customerId}/claims`);
  }

  // Claims Methods
  getMyCustomersClaims(): Observable<any> {
    return this.http.get(`${this.apiUrl}/claims`);
  }

  getPendingClaims(): Observable<any> {
    const url = `${this.apiUrl}/claims/pending`;
    return this.http.get(url);
  }

  getClaimDetails(claimId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/claims/${claimId}`);
  }

  reviewClaim(claimId: string, reviewData: any): Observable<any> {
    const url = `${this.apiUrl}/claims/${claimId}/review`;
    return this.http.put(url, reviewData);
  }

  // Statistics Methods
  getMyClaimStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
