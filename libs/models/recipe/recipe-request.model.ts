export interface RecipeIngredientRequest {
  ingredientId: number;
  quantityRequired: number;
}

export interface RecipeCreateRequest {
  productVariantId: number;
  instructions?: string;
  ingredients: RecipeIngredientRequest[];
}

/** Update does not change the variant, only instructions + ingredients. */
export interface RecipeUpdateRequest {
  instructions?: string;
  ingredients: RecipeIngredientRequest[];
}

/** What the recipe drawer emits when the form is saved. */
export interface RecipePayload {
  productVariantId: number;
  instructions: string;
  ingredients: RecipeIngredientRequest[];
}
