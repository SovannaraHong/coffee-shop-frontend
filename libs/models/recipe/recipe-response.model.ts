export interface RecipeIngredientResponse {
  id: number;
  ingredientId: number;
  ingredientName: string;
  ingredientUnit: string;
  quantityRequired: number;
}

export interface RecipeResponse {
  id: number;
  productVariantId: number;
  productVariantName: string;
  productId: number;
  productName: string;
  instructions: string | null;
  ingredients: RecipeIngredientResponse[];
}
