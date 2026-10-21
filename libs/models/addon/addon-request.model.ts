/** Matches AddonCreateRequest on the backend. */
export interface AddonRequest {
  name: string;
  price: number;
}

/** What the drawer emits. isActive is only used when editing. */
export interface AddonFormValue extends AddonRequest {
  isActive: boolean;
}
