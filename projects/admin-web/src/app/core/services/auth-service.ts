import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import type Keycloak from 'keycloak-js';

/**
 * ADAPTER. If your project already has a Keycloak instance, provide it once in app.config.ts:
 *   { provide: KEYCLOAK, useValue: keycloakInstance }
 * (If you use keycloak-angular, provide its Keycloak instance the same way.)
 * Then delete this file's guesses and keep only what you need.
 */
export const KEYCLOAK = new InjectionToken<Keycloak>('KEYCLOAK');

export interface CurrentUser {
  name: string;
  email?: string;
  roles: string[];
}

/** Roles that can see everything. Change to your real role names. */
const FULL_ACCESS_ROLES = ['ADMIN', 'OWNER'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(KEYCLOAK);

  private readonly _user = signal<CurrentUser | null>(this.read());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  /** Call again after a token refresh if your roles can change while logged in. */
  reload() {
    this._user.set(this.read());
  }

  /**
   * Same keys as nav-items.ts (e.g. 'ORDER_READ').
   * Rule used here: user has that exact role, or a full-access role.
   * Replace with your real permission logic / Spring authority mapping.
   */
  hasPermission(key: string): boolean {
    const roles = this._user()?.roles ?? [];
    return roles.some((r) => FULL_ACCESS_ROLES.includes(r)) || roles.includes(key);
  }

  logout(): void {
    void this.keycloak.logout({ redirectUri: window.location.origin });
  }

  private read(): CurrentUser | null {
    if (!this.keycloak.authenticated) return null;
    const t = this.keycloak.tokenParsed as
      | {
          name?: string;
          preferred_username?: string;
          email?: string;
          realm_access?: { roles?: string[] };
        }
      | undefined;
    return {
      name: t?.name ?? t?.preferred_username ?? 'Staff',
      email: t?.email,
      roles: (t?.realm_access?.roles ?? []).map((r) => r.toUpperCase()),
    };
  }
}
