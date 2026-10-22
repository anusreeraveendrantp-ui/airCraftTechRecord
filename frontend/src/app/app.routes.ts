import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  {
    path: 'aircraft',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./aircraft/list/aircraft-list.component').then(m => m.AircraftListComponent)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./aircraft/detail/aircraft-detail.component').then(m => m.AircraftDetailComponent)
      }
    ]
  },

  {
    path: 'ads',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./ads/ads.component').then(m => m.AdsComponent)
  },

  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./documents/documents.component').then(m => m.DocumentsComponent)
  },

  {
    path: 'audit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'AUDITOR'] },
    loadComponent: () =>
      import('./audit/audit.component').then(m => m.AuditComponent)
  },

  { path: '**', redirectTo: '/dashboard' }
];
