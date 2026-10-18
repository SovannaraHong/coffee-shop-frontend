export const INVENTORY_TRANSACTION_TYPES = ['Purchase', 'Usage', 'Adjustment', 'Waste'] as const;
export type InventoryTransactionType = (typeof INVENTORY_TRANSACTION_TYPES)[number];

export interface InventoryTransactionInput {
  ingredientId: number; // INGREDIENT_ID
  transactionType: InventoryTransactionType; // TRANSACTION_TYPE
  quantity: number; // QUANTITY
  transactionDate: string; // TRANSACTION_DATE
  referenceId: number | null; // REFERENCE_ID
  referenceType: string | null; // REFERENCE_TYPE (e.g. PURCHASE_ORDER, ORDERS, STOCK_ADJUSTMENTS)
  notes: string | null; // NOTES
}

export interface InventoryTransaction extends InventoryTransactionInput {
  id: number; // ID
  createdAt: string; // CREATED_AT
  updatedAt: string | null; // UPDATED_AT
  createdBy: string | null; // CREATED_BY
  updatedBy: string | null; // UPDATED_BY
}
