import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'client/home',
    canActivate: [roleGuard('client')],
    loadComponent: () => import('./pages/client/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'driver/home',
    canActivate: [roleGuard('driver')],
    loadComponent: () => import('./pages/driver/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'admin/dashboard',
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  { path: '**', redirectTo: 'login' },
  {
    path: 'estimate',
    loadComponent: () => import('./pages/estimate/estimate.page').then( m => m.EstimatePage)
  },
];
