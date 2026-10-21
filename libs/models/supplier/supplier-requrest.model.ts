export interface SupplierCreateRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierUpdateRequest extends SupplierCreateRequest {
  isActive?: boolean;
}

/** What the drawer emits. `isActive` is only filled when editing. */
export type SupplierPayload = SupplierUpdateRequest;
