import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'ENGINEER' | 'AUDITOR';
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'tr_token';
  private readonly USER_KEY  = 'tr_user';

  currentUser = signal<AuthUser | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(user => {
          localStorage.setItem(this.TOKEN_KEY, user.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUser.set(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return !!user && roles.includes(user.role);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
