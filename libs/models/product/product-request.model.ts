import { VariantRequest } from '../variant/variant-request.model';

export interface ProductRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  isActive?: boolean;
  featured?: boolean;
  variants: VariantRequest[];
}
