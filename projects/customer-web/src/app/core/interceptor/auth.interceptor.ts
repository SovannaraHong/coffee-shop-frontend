// import { HttpInterceptorFn } from '@angular/common/http';
// import { loadAuth } from '../auth/auth/auth-storage.util';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const auth = loadAuth();

//   if (!auth) {
//     return next(req);
//   }

//   const authorizedReq = req.clone({
//     setHeaders: {
//       Authorization: `${auth.tokenType} ${auth.token}`,
//     },
//   });

//   return next(authorizedReq);
// };
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';
import { loadAuth, saveAuth } from '../auth/auth/auth-storage.util';
import { clearRefreshToken, getRefreshToken, saveRefreshToken } from '../auth/auth/session.util';

interface RefreshResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
}

let refresh$: Observable<void> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // only our API; login/register/refresh themselves are sent without a token
  if (!req.url.includes('/api/') || req.url.includes('/api/auth/')) {
    return next(req);
  }

  const http = inject(HttpClient);
  const router = inject(Router);

  const withToken = (r: HttpRequest<unknown>) => {
    const auth = loadAuth();
    return auth ? r.clone({ setHeaders: { Authorization: `${auth.tokenType} ${auth.token}` } }) : r;
  };

  return next(withToken(req)).pipe(
    catchError((err: HttpErrorResponse) => {
      const refreshToken = getRefreshToken();
      if (err.status !== 401 || !refreshToken) {
        return throwError(() => err);
      }

      if (!refresh$) {
        const base = req.url.substring(0, req.url.indexOf('/api/'));
        refresh$ = http.post<RefreshResponse>(`${base}/api/auth/refresh`, { refreshToken }).pipe(
          map((res) => {
            const auth = loadAuth();
            if (auth) {
              saveAuth({ ...auth, token: res.token, tokenType: res.tokenType });
            }
            saveRefreshToken(res.refreshToken);
          }),
          finalize(() => (refresh$ = null)),
          shareReplay(1),
        );
      }

      return refresh$.pipe(
        catchError((e) => {
          // refresh failed: the session is over
          clearRefreshToken();
          // also clear your stored login here with the clear function your auth-storage.util exports
          router.navigate(['/front/login']);
          return throwError(() => e);
        }),
        switchMap(() => next(withToken(req))),
      );
    }),
  );
};
