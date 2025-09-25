import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminPolicyComponent } from './components/admin/admin-policy/admin-policy.component';
import { AdminPolicyList } from './components/admin/admin-policy-list/admin-policy-list';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AgentDashboardComponent } from './components/admin/agent-dashboard/agent-dashboard.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
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
    path: 'agent', 
    component: AgentDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'agent' }
  },
  { 
    path: 'customer', 
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'customer' }
  },
  
  { path: '**', redirectTo: '/login' }
];
