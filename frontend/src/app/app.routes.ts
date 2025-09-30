import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminPolicyComponent } from './components/admin/admin-policy/admin-policy.component';
import { AdminPolicyList } from './components/admin/admin-policy-list/admin-policy-list.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from './components/customer/customer-dashboard/customer-dashboard.component';
import { CustomerPoliciesComponent } from './components/customer/customer-policies/customer-policies.component';
import { CustomerClaimsComponent } from './components/customer/customer-claims/customer-claims.component';
import { CustomerProfileComponent } from './components/customer/customer-profile/customer-profile.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UsersAgents } from './components/admin/users-agents/users-agents.component';
import { CreateAgent } from './components/admin/create-agent/create-agent.component';
import { AuditLogsComponent } from './components/admin/audit-logs/audit-logs.component';
import { SummaryDashboardComponent } from './components/admin/summary-dashboard/summary-dashboard.component';
import { AgentDashbaord } from './components/agent/agent-dashbaord/agent-dashbaord.component';
import { AgentCustomers } from './components/agent/agent-customers/agent-customers.component';
import { PendingClaims } from './components/agent/pending-claims/pending-claims.component';
import { AgentStats } from './components/agent/agent-stats/agent-stats.component';
import { AgentProfile } from './components/agent/agent-profile/agent-profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
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
  { 
    path: 'agent', 
    component: AgentDashbaord,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'agent' },
    children: [
      { 
        path: 'customers', 
        component: AgentCustomers
      },
      { 
        path: 'pending-claims', 
        component: PendingClaims
      },
      { 
        path: 'stats', 
        component: AgentStats
      },
      { 
        path: 'profile', 
        component: AgentProfile
      }
    ]
  },
  
  { path: '**', redirectTo: '/home' }
];
