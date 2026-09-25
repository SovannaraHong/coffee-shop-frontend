export interface AddressCreateRequest {
  customerId: number;
  label?: string;
  addressLine: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}
export interface AddressUpdateRequest {
  label?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}
