export const INVENTORY_TRANSACTION_TYPES = ['in', 'out', 'adjustment'] as const;

export interface InventoryTransaction {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  referenceType: string | null;
  type: string; // enum name from the API: "IN" | "OUT" | "ADJUSTMENT"
  referenceId: number | null;
  transactionDate: string; // ISO LocalDateTime
  note: string | null;
}
