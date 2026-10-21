export interface AddonIngredientResponse {
  id: number;
  addonId: number;
  addonName: string;
  ingredientId: number;
  ingredientName: string;
  ingredientUnit: string;
  quantityRequired: number;
}

/** Minimal ingredient info used by the dropdown. */
export interface IngredientOption {
  id: number;
  name: string;
  unit: string;
}
