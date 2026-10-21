export interface StockAdjustmentResponse {
  id: number;
  ingredientId: number;
  ingredientName: string;
  oldQuantity: number;
  newQuantity: number;
  currentStock: number | null;
  notes: string | null;
  createdAt: string; // ISO LocalDateTime
}

// ASSUMPTION: adjust to whatever StockAdjustmentService.getAllAdjustments(params) reads.
export interface StockAdjustmentPaginationParams {
  page?: number;
  size?: number;
  search?: string;
  ingredientId?: number;
}
