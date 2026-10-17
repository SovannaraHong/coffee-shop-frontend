import { LockoutService } from './../../../../../../../libs/services/Lockout/Lockout.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginLockGuard: CanActivateFn = (route, state) => {
  const lockout = inject(LockoutService);
  const router = inject(Router);
  return lockout.remainingSeconds() > 0 ? router.createUrlTree(['/rate-limit']) : true;
};
