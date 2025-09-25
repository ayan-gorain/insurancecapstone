import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminPolicyComponent } from './components/admin-policy/admin-policy.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AgentDashboardComponent } from './components/agent-dashboard/agent-dashboard.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  
  // Dashboard routes with guards
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'admin/policy', 
    component: AdminPolicyComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
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
