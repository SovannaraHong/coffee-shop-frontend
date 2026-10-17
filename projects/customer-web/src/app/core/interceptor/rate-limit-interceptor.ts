import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LockoutService } from '../../../../../../libs/services/Lockout/Lockout.service';

const LOGIN_LOCK_CODES = ['ACCOUNT_LOCKED', 'IP_BANNED'];

export const rateLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const lockout = inject(LockoutService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 429) {
        const retryAfter =
          Number(error.error?.retryAfterSeconds) ||
          Number(error.headers.get('Retry-After')) ||
          undefined;

        if (LOGIN_LOCK_CODES.includes(error.error?.code)) {
          lockout.set(retryAfter ?? 60);
        }
        if (!router.url.startsWith('/rate-limit')) {
          void router.navigate(['/rate-limit'], {
            queryParams: retryAfter ? { retryAfter } : {},
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
