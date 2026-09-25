import { HttpInterceptorFn } from '@angular/common/http';
import { loadAuth } from '../auth/auth-storage.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = loadAuth();

  if (!auth) {
    return next(req);
  }

  const authorizedReq = req.clone({
    setHeaders: {
      Authorization: `${auth.tokenType} ${auth.token}`,
    },
  });

  return next(authorizedReq);
};
