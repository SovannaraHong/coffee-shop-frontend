// What is sent to the API
export interface AddonIngredientInput {
  ingredientId: number; // INGREDIENT_ID
  quantityRequired: number; // QUANTITY_REQUIRED
}

// A full row returned by the API
export interface AddonIngredient extends AddonIngredientInput {
  id: number; // ID
  addonId: number; // ADDON_ID
  ingredientName?: string; // optional, if your API joins it
  unit?: string; // optional, if your API joins it
  createdAt: string; // CREATED_AT
  updatedAt: string | null; // UPDATED_AT
  createdBy: string | null; // CREATED_BY
  updatedBy: string | null; // UPDATED_BY
}
