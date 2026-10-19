import {
  AuthUser,
  LoginResponse,
  Session,
  TokenResponse,
} from './../../../../../../libs/models/auth/auth.models';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const AUTH_ENDPOINTS = {
  login: '/auth/staff/login',
  refresh: '/auth/staff/refresh',
  logout: '/auth/staff/logout',
  forgotPassword: '/auth/forgot-password',
} as const;

const STORAGE_KEY = 'apsara.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<Session | null>(this.restore());

  private refreshInFlight$: Observable<string> | null = null;

  readonly isAuthenticated = computed(() => !!this.session());
  readonly user = computed<AuthUser | null>(() => this.session()?.user ?? null);

  accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }
  hasRefreshToken(): boolean {
    return !!this.session()?.refreshToken;
  }

  login(
    email: string,
    password: string,
    remember: boolean,
    otp?: string,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}${AUTH_ENDPOINTS.login}`, {
        email,
        password,
        ...(otp ? { otp } : {}),
      })
      .pipe(
        tap((res) => {
          if (res.accessToken) this.persist(res as TokenResponse, remember, res.user ?? null);
        }),
      );
  }

  /** Gets a new access token. Parallel callers share one request. */
  refresh(): Observable<string> {
    if (this.refreshInFlight$) return this.refreshInFlight$;

    const current = this.session();
    if (!current) return throwError(() => new Error('No active session'));

    this.refreshInFlight$ = this.http
      .post<TokenResponse>(`${environment.apiUrl}${AUTH_ENDPOINTS.refresh}`, {
        refreshToken: current.refreshToken,
      })
      .pipe(
        tap((res) => this.persist(res, current.remember, current.user)),
        map((res) => res.accessToken),
        finalize(() => (this.refreshInFlight$ = null)),
        shareReplay(1),
      );
    return this.refreshInFlight$;
  }

  /** Navigates to /login first, then clears the session, so the admin shell never re-renders without a user. */
  logout(redirect = true): void {
    const current = this.session();

    if (current?.refreshToken) {
      this.http
        .post(`${environment.apiUrl}${AUTH_ENDPOINTS.logout}`, {
          refreshToken: current.refreshToken,
        })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    if (!redirect) {
      this.clear();
      return;
    }

    this.router.navigateByUrl('/login', { replaceUrl: true }).then(
      () => this.clear(),
      () => {
        this.clear();
        window.location.assign('/login'); // last resort: full reload
      },
    );
  }

  /** The backend always answers OK, whether or not the email exists. */
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}${AUTH_ENDPOINTS.forgotPassword}`, { email });
  }
  // ---- storage ----

  private persist(tokens: TokenResponse, remember: boolean, user: AuthUser | null): void {
    const s: Session = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
      remember,
      user,
    };
    this.session.set(s);
    try {
      const target = remember ? localStorage : sessionStorage;
      const other = remember ? sessionStorage : localStorage;
      other.removeItem(STORAGE_KEY);
      target.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch (e) {
      return null;
    }
  }

  private clear(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
