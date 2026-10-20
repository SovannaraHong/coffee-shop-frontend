export interface IngredientResponse {
  id: number;
  name: string;
  unit: string;
  quantityInStock: number;
  reorderLevel: number;
  isLowStock: boolean;
  isActive: boolean;
  createdAt: string;
}
