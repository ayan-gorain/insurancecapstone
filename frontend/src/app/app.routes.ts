import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminPolicyComponent } from './components/admin/admin-policy/admin-policy.component';
import { AdminPolicyList } from './components/admin/admin-policy-list/admin-policy-list';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from './components/customer/customer-dashboard/customer-dashboard.component';
import { CustomerPoliciesComponent } from './components/customer/customer-policies/customer-policies.component';
import { CustomerClaimsComponent } from './components/customer/customer-claims/customer-claims.component';
import { CustomerProfileComponent } from './components/customer/customer-profile/customer-profile.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UsersAgents } from './components/admin/users-agents/users-agents';
import { CreateAgent } from './components/admin/create-agent/create-agent';
import { AuditLogsComponent } from './components/admin/audit-logs/audit-logs.component';
import { SummaryDashboardComponent } from './components/admin/summary-dashboard/summary-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  
  // Dashboard routes with guards
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { 
        path: 'policy', 
        component: AdminPolicyComponent
      },
      { 
        path: 'policies', 
        component: AdminPolicyList
      },
      { 
        path: 'view-users-agents', 
        component: UsersAgents
      },
      { 
        path: 'create-agent', 
        component: CreateAgent
      },
      { 
        path: 'audit-logs', 
        component: AuditLogsComponent
      },
      { 
        path: 'summary', 
        component: SummaryDashboardComponent
      },

    ]
  },
  { 
    path: 'customer', 
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'customer' },
    children: [
      { 
        path: 'policies', 
        component: CustomerPoliciesComponent
      },
      { 
        path: 'claims', 
        component: CustomerClaimsComponent
      },
      { 
        path: 'profile', 
        component: CustomerProfileComponent
      }
    ]
  },
  
  { path: '**', redirectTo: '/login' }
];
