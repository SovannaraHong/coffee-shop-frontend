export interface IngredientCreateRequest {
  name: string;
  unit: string;
  quantityInStock?: number;
  reorderLevel?: number;
}

export interface IngredientUpdateRequest {
  name: string;
  unit: string;
  reorderLevel?: number;
}

/** Used by increment-stock and decrement-stock. */
export interface StockAdjustRequest {
  quantity: number;
  /** Required by the backend (@NotBlank). */
  referenceType: string;
  referenceId?: number;
  notes?: string;
}

/** Used by adjust-stock (set an exact value). Notes are required. */
export interface StockSetRequest {
  newQuantity: number;
  notes: string;
}

/**
 * ASSUMPTION: I haven't seen which referenceType values your service accepts.
 * Change the `value` strings here (one place) to match your backend.
 */
export const STOCK_REASONS: { value: string; label: string }[] = [
  { value: 'PURCHASE', label: 'Purchase / restock' },
  { value: 'WASTE', label: 'Waste / spoilage' },
  { value: 'MANUAL', label: 'Manual adjustment' },
];

/** What the ingredient drawer emits when the form is saved. */
export interface IngredientPayload {
  name: string;
  unit: string;
  /** Only used when creating. */
  quantityInStock?: number;
  reorderLevel?: number;
}
