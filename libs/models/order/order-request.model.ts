export interface OrderCreateRequest {
  customerId: number;
  addressId?: number | null;
  note?: string | null;
  details: OrderDetailRequest[];
}

export interface OrderDetailRequest {
  variantId: number;
  quantity: number;
  addons?: OrderDetailAddonRequest[];
}

export interface OrderDetailAddonRequest {
  addonId: number;
  quantity: number;
}
