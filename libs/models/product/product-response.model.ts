import { VariantResponse } from '../variant/variant-response.model';

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  featured: boolean;
  categoryId: number;
  categoryName: string;
  variants: VariantResponse[];
}
