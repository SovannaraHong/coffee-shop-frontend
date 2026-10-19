import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again',
): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Cannot reach the server. Check your connection and try again.';
    }

    const body = err.error;

    const fromApi =
      typeof body === 'string' ? body : (body?.message ?? body?.detail ?? body?.title);

    if (fromApi && typeof fromApi === 'string') {
      return fromApi;
    }

    if (err.status === 401) {
      return 'Invalid email or password.';
    }

    if (err.status === 403) {
      return 'You do not have permission to do this.';
    }

    if (err.status === 429) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    if (err.status >= 500) {
      return 'Server error. Please try again later.';
    }
  }

  return fallback;
}
