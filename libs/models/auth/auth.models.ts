export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // seconds
  refreshExpiresIn: number; // seconds
}

export interface LoginResponse extends Partial<TokenResponse> {
  otpRequired?: boolean;
  user?: AuthUser;
}
export interface AuthUser {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  remember: boolean;
  user: AuthUser | null;
}
