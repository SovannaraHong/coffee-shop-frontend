export interface AddressResponse {
  id: number;
  customerId: number;
  label: string | null;
  addressLine: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isDefault: boolean;
}
