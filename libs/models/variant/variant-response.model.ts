export interface VariantResponse {
  id: number;
  productName: string;
  name: string;
  price: number;
  sku: string | null;
  isActive: boolean;
}

export interface ProductOption {
  id: number;
  name: string;
}
