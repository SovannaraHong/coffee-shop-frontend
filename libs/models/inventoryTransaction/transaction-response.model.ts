export const INVENTORY_TRANSACTION_TYPES = ['in', 'out', 'adjustment'] as const;

export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface TransactionResponse {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  referenceType: string | null;
  type: TransactionType;
  referenceId: number | null;
  transactionDate: string; // ISO LocalDateTime
  note: string | null;
}

// Adjust these to whatever your backend getPagination(params) reads.
export interface TransactionPaginationParams {
  page?: number;
  size?: number;
  search?: string;
  type?: TransactionType;
  ingredientId?: number;
}
