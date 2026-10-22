import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-icon class="logo-icon">flight</mat-icon>
          <mat-card-title>Aircraft Technical Records</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="username">
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'"
                     formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword"
                      [attr.aria-label]="'Toggle password visibility'"
                      [attr.aria-pressed]="!hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <p class="error-message" *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn"
                    [disabled]="loading || form.invalid">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p class="demo-hint">
            Demo: <code>admin&#64;techrecords.dev</code> / <code>Password123!</code>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
    }
    .login-card { width: 400px; padding: 16px; }
    mat-card-header { justify-content: center; text-align: center; padding-bottom: 16px; }
    .logo-icon { font-size: 48px; width: 48px; height: 48px; color: #1a237e; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 8px; height: 44px; }
    .error-message { color: #c62828; font-size: 14px; margin: 4px 0; }
    .demo-hint { text-align: center; font-size: 12px; color: #666; padding: 8px; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail ?? 'Invalid email or password';
      }
    });
  }
}
