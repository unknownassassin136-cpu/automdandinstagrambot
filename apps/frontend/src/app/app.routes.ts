import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(c => c.LoginComponent) },
      { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(c => c.RegisterComponent) },
      { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(c => c.ResetPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'automations', loadComponent: () => import('./pages/automations/list/list.component').then(c => c.AutomationsListComponent) },
      { path: 'automations/new', loadComponent: () => import('./pages/automations/builder/builder.component').then(c => c.BuilderComponent) },
      { path: 'automations/edit/:id', loadComponent: () => import('./pages/automations/builder/builder.component').then(c => c.BuilderComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(c => c.SettingsComponent) }
    ]
  },
  {
    path: 'oauth/callback',
    loadComponent: () => import('./pages/oauth/callback/callback.component').then(c => c.CallbackComponent)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/admin/overview/overview.component').then(c => c.AdminOverviewComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/users/users.component').then(c => c.AdminUsersComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
