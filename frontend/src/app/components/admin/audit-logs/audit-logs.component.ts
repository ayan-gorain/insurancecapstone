import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuditLog {
  _id: string;
  action: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
  };
  details: any;
  timestamp: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.error = null;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const apiUrl = 'http://localhost:4000/api/v1';

    this.http.get<AuditLog[]>(`${apiUrl}/admin/audit`, { headers }).subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.error = error.error?.message || 'Failed to load audit logs';
        this.loading = false;
      }
    });
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'CREATE_AGENT':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'ASSIGN_AGENT':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'CREATE_POLICY':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'UPDATE_POLICY':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'DELETE_POLICY':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'UPDATE_CLAIM':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getActionDescription(action: string, details: any): string {
    switch (action) {
      case 'CREATE_AGENT':
        return 'Created a new agent';
      case 'ASSIGN_AGENT':
        return 'Assigned agent to customer';
      case 'CREATE_POLICY':
        return 'Created a new policy';
      case 'UPDATE_POLICY':
        return 'Updated policy details';
      case 'DELETE_POLICY':
        return 'Deleted a policy';
      case 'UPDATE_CLAIM':
        return `Updated claim status to ${details?.status || 'unknown'}`;
      default:
        return action.replace(/_/g, ' ').toLowerCase();
    }
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  formatActionName(action: string): string {
    return action.replace(/_/g, ' ');
  }
}
