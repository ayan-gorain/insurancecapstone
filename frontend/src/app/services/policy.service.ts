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
}
