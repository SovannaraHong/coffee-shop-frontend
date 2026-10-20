import { VariantRequest } from '../variant/variant-request.model';

export interface ProductRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  isActive?: boolean;
  featured?: boolean;
  variants: VariantRequest[];
  addonIds?: number[];
}

export interface ProductPayload {
  name: string;
  description: string;
  imageUrl?: string | null;
  imageFile?: File | null;
  categoryId: number;
  isActive: boolean;
  featured: boolean;
  addonIds: number[];
  variants: VariantRequest[];
}
