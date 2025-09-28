import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.post(`${this.apiUrl}/admin/policies`, policyData);
  }

  getPolicies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/policies`);
  }
  deletePolicy(policyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/policies/${policyId}`);
  }
  updatePolicy(policyid: string, policyData: Partial<PolicyData>): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/policies/${policyid}`, policyData);
  }

  // Public method to get policies without authentication
  getPublicPolicies(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:4000/public/policies`);
  }
}
