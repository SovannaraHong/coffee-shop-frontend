import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_ENDPOINTS, AuthService } from '../auth/auth-service';
import { environment } from '../../environments/environment';
import { catchError, switchMap, throwError } from 'rxjs';

const isAuthCall = (url: string) => Object.values(AUTH_ENDPOINTS).some((p) => url.includes(p));

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (!req.url.startsWith(environment.apiUrl) || isAuthCall(req.url)) return next(req);

  const withToken = (token: string | null) =>
    token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(withToken(auth.accessToken())).pipe(
    catchError((err) => {
      const expired =
        err instanceof HttpErrorResponse && err.status === 401 && auth.hasRefreshToken();
      if (!expired) return throwError(() => err);

      // Access token expired: refresh once, then retry the original request
      return auth.refresh().pipe(
        switchMap((token) => next(withToken(token))),
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
