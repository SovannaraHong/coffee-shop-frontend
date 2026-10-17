import { Injectable } from '@angular/core';
import KeycloakClient from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeycloakAuthService {
  private keycloakClient: KeycloakClient;

  constructor() {
    this.keycloakClient = new KeycloakClient({
      url: 'http://localhost:8081',
      realm: 'myrealm',
      clientId: 'customer-web',
    });
  }

  async init(): Promise<boolean> {
    return this.keycloakClient.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
  }

  async login(): Promise<void> {
    await this.keycloakClient.login({
      redirectUri: window.location.origin,
    });
  }

  async register(): Promise<void> {
    await this.keycloakClient.register({
      redirectUri: window.location.origin,
    });
  }

  async logout(): Promise<void> {
    await this.keycloakClient.logout({
      redirectUri: window.location.origin,
    });
  }

  getToken(): string | undefined {
    return this.keycloakClient.token;
  }

  isLoggedIn(): boolean {
    return this.keycloakClient.authenticated ?? false;
  }
}
