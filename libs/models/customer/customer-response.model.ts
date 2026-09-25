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

export interface LoginResponse {
  token: string;
  tokenType: string;
  customer: CustomerResponse;
}
