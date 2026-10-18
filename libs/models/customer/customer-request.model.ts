export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}
export interface CustomerUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
}
