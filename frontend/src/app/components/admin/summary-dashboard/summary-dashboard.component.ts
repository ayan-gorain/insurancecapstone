import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface SummaryData {
  users: number;
  agents: number;
  claimsPending: number;
  claimsApproved: number;
  claimsRejected: number;
  policies: number;
}

@Component({
  selector: 'app-summary-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-dashboard.component.html',
  styleUrl: './summary-dashboard.component.css'
})
export class SummaryDashboardComponent implements OnInit {
  summaryData: SummaryData | null = null;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    this.loading = true;
    this.error = null;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const apiUrl = 'http://localhost:4000/api/v1';

    this.http.get<SummaryData>(`${apiUrl}/admin/summary`, { headers }).subscribe({
      next: (data) => {
        this.summaryData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading summary data:', error);
        this.error = error.error?.message || 'Failed to load summary data';
        this.loading = false;
      }
    });
  }

  getTotalClaims(): number {
    if (!this.summaryData) return 0;
    return this.summaryData.claimsPending + this.summaryData.claimsApproved + this.summaryData.claimsRejected;
  }

  getClaimsApprovalRate(): number {
    if (!this.summaryData || this.getTotalClaims() === 0) return 0;
    return Math.round((this.summaryData.claimsApproved / this.getTotalClaims()) * 100);
  }
}
