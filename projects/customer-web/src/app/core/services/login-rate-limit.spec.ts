import { TestBed } from '@angular/core/testing';
import { LoginRateLimit } from './login-rate-limit';

describe('LoginRateLimit', () => {
  let service: LoginRateLimit;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginRateLimit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
