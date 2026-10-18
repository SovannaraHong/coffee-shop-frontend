import { TestBed } from '@angular/core/testing';
import { AuthService, KEYCLOAK } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // AuthService needs a Keycloak instance — use a fake one in tests
      providers: [{ provide: KEYCLOAK, useValue: { authenticated: false, logout: () => Promise.resolve() } }],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be logged in without a Keycloak session', () => {
    expect(service.isLoggedIn()).toBe(false);
  });
});
