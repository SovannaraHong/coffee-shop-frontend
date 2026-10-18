export interface Product {
  id: number;
  sku: string;
  name: string;
  categoryId: number;
  price: number;
  cost: number;
  sizes: string[];
  available: boolean;
  description: string;
  imageUrl?: string;
}
