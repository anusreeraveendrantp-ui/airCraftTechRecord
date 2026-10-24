import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
  ],
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else loginOnly">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <div class="brand">
            <span>TechRecords</span>
          </div>
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/aircraft" routerLinkActive="active-link">
              <span matListItemTitle>Aircraft</span>
            </a>
            <a mat-list-item routerLink="/ads" routerLinkActive="active-link">
              <span matListItemTitle>Airworthiness Directives</span>
            </a>
            <a mat-list-item routerLink="/documents" routerLinkActive="active-link">
              <span matListItemTitle>Documents</span>
            </a>
            <a mat-list-item routerLink="/audit" routerLinkActive="active-link"
               *ngIf="auth.hasRole('ADMIN') || auth.hasRole('AUDITOR')">
              <span matListItemTitle>Audit Log</span>
            </a>
          </mat-nav-list>

          <div class="sidenav-footer">
            <button mat-button (click)="logout()" class="logout-btn">
              Sign out
            </button>
          </div>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary" class="app-toolbar">
            <span>{{ auth.currentUser()?.name }}</span>
            <span class="spacer"></span>
            <span class="role-chip">{{ auth.currentUser()?.role }}</span>
          </mat-toolbar>
          <main class="main-content">
            <router-outlet />
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <ng-template #loginOnly>
      <router-outlet />
    </ng-template>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; background: #1a237e; color: white; display: flex; flex-direction: column; }
    .brand { display: flex; align-items: center; gap: 8px; padding: 20px 16px; font-size: 18px; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .sidenav-footer { margin-top: auto; padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-btn { color: rgba(255,255,255,0.7); width: 100%; }
    .active-link { background: rgba(255,255,255,0.15) !important; }
    mat-nav-list a { color: #ffffff; }
    mat-nav-list a span { color: #ffffff; }
    .app-toolbar { position: sticky; top: 0; z-index: 100; }
    .spacer { flex: 1; }
    .role-chip { background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .main-content { padding: 0; }
  `]
})
export class AppComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
