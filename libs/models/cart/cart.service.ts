import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from './cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  // drawer visibility — the single source of truth, not a route
  isOpen = signal(false);

  // ---- cart data (replace with your real API / persisted state) ----
  cartItems = signal<CartItem[]>([
    {
      productId: 1,
      productName: "Bal d'Afrique",
      imageUrl: '/assets/images/products/bal-dafrique.webp',
      variantId: 11,
      variantName: '225 ml',
      price: 40,
      quantity: 1,
      addons: [],
      subtotal: 40,
    },
    {
      productId: 2,
      productName: 'Seven Veils',
      imageUrl: '/assets/images/products/seven-veils.webp',
      variantId: 21,
      variantName: '100 ml',
      price: 180,
      quantity: 1,
      addons: [],
      subtotal: 180,
    },
    {
      productId: 3,
      productName: "Rose of no Man's Land",
      imageUrl: '/assets/images/products/rose-no-mans-land.webp',
      variantId: 31,
      variantName: '30 ml',
      price: 32,
      quantity: 1,
      addons: [],
      subtotal: 32,
    },
  ]);

  itemCount = computed(() => this.cartItems().reduce((sum, i) => sum + i.quantity, 0));
  subtotal = computed(() => this.cartItems().reduce((sum, i) => sum + i.subtotal, 0));
  shipping = computed(() => (this.subtotal() === 0 || this.subtotal() >= 50 ? 0 : 5));
  tax = computed(() => +(this.subtotal() * 0.15).toFixed(2));
  total = computed(() => +(this.subtotal() + this.shipping() + this.tax()).toFixed(2));

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  private unitPrice(item: CartItem): number {
    const addonsTotal = item.addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
    return item.price + addonsTotal;
  }

  incrementItem(index: number) {
    this.updateQty(index, this.cartItems()[index].quantity + 1);
  }

  decrementItem(index: number) {
    this.updateQty(index, Math.max(1, this.cartItems()[index].quantity - 1));
  }

  private updateQty(index: number, quantity: number) {
    this.cartItems.update((items) =>
      items.map((item, i) =>
        i === index ? { ...item, quantity, subtotal: this.unitPrice(item) * quantity } : item,
      ),
    );
  }

  removeItem(index: number) {
    this.cartItems.update((items) => items.filter((_, i) => i !== index));
  }
}
