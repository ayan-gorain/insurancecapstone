import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PolicyData {
  code: string;
  title: string;
  description: string;
  premium: number;
  termMonths: number;
  minSumInsured: number;
  image: string;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createPolicy(policyData: PolicyData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/admin/policies`, policyData, { headers });
  }

  getPolicies(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any[]>(`${this.apiUrl}/admin/policies`, { headers });
  }
  deletePolicy(policyId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete(`${this.apiUrl}/admin/policies/${policyId}`, { headers });
  }
  updatePolicy(policyid: string, policyData: Partial<PolicyData>): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/admin/policies/${policyid}`, policyData, { headers });
  }

  // Public method to get policies without authentication
  getPublicPolicies(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:4000/public/policies`);
  }
}
