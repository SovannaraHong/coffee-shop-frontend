export const INGREDIENT_UNITS = ['g', 'kg', 'ml', 'L', 'pcs'] as const;
export type IngredientUnit = (typeof INGREDIENT_UNITS)[number];

// What the form edits (no id, no audit fields)
export interface IngredientInput {
  name: string; // NAME
  unit: IngredientUnit; // UNIT
  quantityInStock: number; // QUANTITY_IN_STOCK
  reorderLevel: number; // REORDER_LEVEL
  isActive: boolean; // IS_ACTIVE
}

// A full row from the table
export interface Ingredient extends IngredientInput {
  id: number; // ID
  createdAt: string; // CREATED_AT
  updatedAt: string | null; // UPDATED_AT
  createdBy: string | null; // CREATED_BY
  updatedBy: string | null; // UPDATED_BY
}
