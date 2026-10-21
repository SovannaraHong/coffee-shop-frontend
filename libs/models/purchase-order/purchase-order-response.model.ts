export interface PurchaseOrderDetail {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrderResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  orderDate: string; // ISO LocalDateTime
  status: string; // PurchaseOrderStatus enum name
  totalAmount: number;
  details: PurchaseOrderDetail[];
}

/** Spring Data Page shape (the controller returns Page<PurchaseOrderResponse>). */
export interface PurchaseOrderPage {
  content: PurchaseOrderResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PurchaseOrderPaginationParams {
  page?: number;
  size?: number;
}

export interface SupplierOption {
  id: number;
  name: string;
}

export interface IngredientOption {
  id: number;
  name: string;
  unit: string;
}
