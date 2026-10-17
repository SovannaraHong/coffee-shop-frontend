const REFRESH_KEY = 'refresh_token';

export function saveRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_KEY);
}
