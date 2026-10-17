import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { loginLockGuard } from './login-lock-guard';

describe('loginLockGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => loginLockGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
