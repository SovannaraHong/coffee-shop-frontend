const TOKEN_KEY = 'token';
const TOKEN_TYPE_KEY = 'tokenType';
const CUSTOMER_KEY = 'customerResponse';
const EXPIRES_AT_KEY = 'tokenExpiresAt';

export interface StoreAuth<TCustomer = unknown> {
  token: string;
  tokenType: string;
  customer: TCustomer;
}
function decodeJwtExpiryMs(token: string): number | null {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload: { exp?: number } = JSON.parse(json);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
export function saveAuth<TCustomer>(auth: StoreAuth<TCustomer>): void {
  const decodedExpiry = decodeJwtExpiryMs(auth.token);
  const fallbackExpiry = Date.now() + 24 * 60 * 60 * 1000;
  const expiresAt = decodedExpiry ?? fallbackExpiry;

  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(TOKEN_TYPE_KEY, auth.tokenType);
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(auth.customer));
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}
export function loadAuth<TCustomer = unknown>(): StoreAuth<TCustomer> | null {
  const expiresAtRaw = localStorage.getItem(EXPIRES_AT_KEY);

  if (!expiresAtRaw || Date.now() > Number(expiresAtRaw)) {
    clearAuth();
    return null;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const tokenType = localStorage.getItem(TOKEN_TYPE_KEY);
  const customerRaw = localStorage.getItem(CUSTOMER_KEY);

  if (!token || !tokenType || !customerRaw) {
    clearAuth();
    return null;
  }

  try {
    const customer = JSON.parse(customerRaw) as TCustomer;
    return { token, tokenType, customer };
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth(): void {
  for (const key of [TOKEN_KEY, TOKEN_TYPE_KEY, CUSTOMER_KEY, EXPIRES_AT_KEY]) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export function getToken(): string | null {
  return loadAuth()?.token ?? null;
}
