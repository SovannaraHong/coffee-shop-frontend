export type SupplierStatus = 'Active' | 'Inactive';

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  supplies: string;
  status: SupplierStatus;
  lastDelivery: string;
}
