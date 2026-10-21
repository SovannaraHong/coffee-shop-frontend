/** Matches PurchaseOrderCreateRequest on the backend. */
export interface PurchaseOrderDetailRequest {
  ingredientId: number;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  details: PurchaseOrderDetailRequest[];
}
