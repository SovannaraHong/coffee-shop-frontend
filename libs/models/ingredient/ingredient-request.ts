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

/**
 * Must match the Java enum StockReferenceType exactly:
 * PURCHASE_ORDER, WASTE, MANUAL
 */
export const STOCK_REASONS = [
  { value: 'PURCHASE_ORDER', label: 'Purchase / restock' },
  { value: 'WASTE', label: 'Waste / spoilage' },
  { value: 'MANUAL', label: 'Manual adjustment' },
] as const;

export type StockReason = (typeof STOCK_REASONS)[number]['value'];

/** Used by increment-stock (Add) and decrement-stock (Remove). */
export interface StockAdjustRequest {
  quantity: number;
  /** Required by the backend. Must be one of StockReason. */
  referenceType: StockReason;
  /** Optional, e.g. a purchase order id. */
  referenceId?: number | null;
  notes?: string;
}

/** Used by adjust-stock (Set exact). Notes are required. */
export interface StockSetRequest {
  newQuantity: number;
  notes: string;
}

/** What the ingredient drawer emits when the form is saved. */
export interface IngredientPayload {
  name: string;
  unit: string;
  /** Only used when creating. */
  quantityInStock?: number;
  reorderLevel?: number;
}
