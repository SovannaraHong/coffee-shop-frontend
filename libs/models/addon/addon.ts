export interface AddonInput {
  name: string;
  price: number;
  isActive: boolean;
}

export interface Addon extends AddonInput {
  id: number; // ID
  createdAt: string; // CREATED_AT
  updatedAt: string | null; // UPDATED_AT
  createdBy: string | null; // CREATED_BY
  updatedBy: string | null; // UPDATED_BY
}
