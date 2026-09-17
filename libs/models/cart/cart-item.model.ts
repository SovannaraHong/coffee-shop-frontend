export interface CartItem {
  productId: number;
  productName: string;
  imageUrl?: string;

  variantId: number;
  variantName: string;
  price: number;

  quantity: number;

  addons: CartItemAddon[];

  subtotal: number;
}

export interface CartItemAddon {
  addonId: number;
  addonName: string;
  price: number;
  quantity: number;
}
