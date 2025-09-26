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
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }

  updateMyProfile(profile: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.put(`${this.apiUrl}/profile`, profile, { headers });
  }

  // Customer Methods
  getMyCustomers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.apiUrl}/customers`, { headers });
  }

  getCustomerPolicies(customerId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.apiUrl}/customers/${customerId}/policies`, { headers });
  }

  getCustomerClaims(customerId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.apiUrl}/customers/${customerId}/claims`, { headers });
  }

  // Claims Methods
  getMyCustomersClaims(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.apiUrl}/claims`, { headers });
  }

  getPendingClaims(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Agent Service - Get Pending Claims - Token present:', !!token);
    console.log('Agent Service - Get Pending Claims - Token value:', token ? token.substring(0, 20) + '...' : 'No token');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const url = `${this.apiUrl}/claims/pending`;
    console.log('Agent Service - Get Pending Claims - URL:', url);
    console.log('Agent Service - Get Pending Claims - Headers:', headers);
    
    return this.http.get(url, { headers });
  }

  getClaimDetails(claimId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return this.http.get(`${this.apiUrl}/claims/${claimId}`, { headers });
  }

  reviewClaim(claimId: string, reviewData: any): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Agent Service - Review Claim - Claim ID:', claimId);
    console.log('Agent Service - Review Claim - Review Data:', reviewData);
    console.log('Agent Service - Review Claim - Token present:', !!token);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const url = `${this.apiUrl}/claims/${claimId}/review`;
    console.log('Agent Service - Review Claim - URL:', url);
    console.log('Agent Service - Review Claim - Headers:', headers);
    
    return this.http.put(url, reviewData, { headers });
  }

  // Statistics Methods
  getMyClaimStats(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Agent Service - Token present:', !!token);
    console.log('Agent Service - Token value:', token ? token.substring(0, 20) + '...' : 'No token');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Agent Service - Making request to:', `${this.apiUrl}/stats`);
    console.log('Agent Service - Headers:', headers);
    
    return this.http.get(`${this.apiUrl}/stats`, { headers });
  }
}
