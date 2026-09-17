export interface OrderDetailResponse {
  id: number;

  variantId: number;
  variantName: string;

  quantity: number;
  unitPrice: number;
  subtotal: number;

  addons: OrderDetailAddonResponse[];
}

export interface OrderDetailAddonResponse {
  id: number;

  addonId: number;
  addonName: string;

  quantity: number;
  unitPrice: number;
  subtotal: number;
}
