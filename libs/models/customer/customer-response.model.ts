export interface CustomerResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isVerified: boolean;
  isActive: boolean;
}
export interface CustomerLoginResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  customer: CustomerResponse;
}
