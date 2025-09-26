import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService, PolicyData } from '../../services/policy.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  policies$: Observable<PolicyData[]> | undefined;
  loading = true;
  error: string | null = null;

  constructor(private policyService: PolicyService) {}

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.loading = true;
    this.error = null;
    
    this.policies$ = this.policyService.getPublicPolicies();
    this.policies$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load policies. Please try again later.';
        this.loading = false;
        console.error('Error loading policies:', err);
      }
    });
  }
}
