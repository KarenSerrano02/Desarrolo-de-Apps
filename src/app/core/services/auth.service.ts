import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role, User } from '../models/user.model';

const TOKEN_KEY = 'uber_token';
const USER_KEY = 'uber_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/login`, data)
      .pipe(tap((res) => this.saveSession(res)));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/register`, data)
      .pipe(tap((res) => this.saveSession(res)));
  }

  forgotPassword(email: string, newPassword: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.api}/auth/forgot-password`,
      { email, new_password: newPassword }
    );
  }

  me() {
    return this.http.get<{ success: boolean; user: User }>(`${this.api}/auth/me`);
  }

  logout(): void {
    this.http
      .post(`${this.api}/auth/logout`, {})
      .pipe(
        catchError(() => of(null)),
        finalize(() => {
          this.clearSession();
          this.router.navigateByUrl('/login', { replaceUrl: true });
        })
      )
      .subscribe();
  }

  saveSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  homeFor(role: Role): string {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'driver':
        return '/driver/home';
      default:
        return '/client/home';
    }
  }

  goToHome(): void {
    const user = this.getUser();
    this.router.navigateByUrl(user ? this.homeFor(user.role) : '/login', { replaceUrl: true });
  }
}
