import { CartItem } from './../../models/cart/cart-item.model';
import { Injectable, computed, effect, signal } from '@angular/core';

const CART_STORAGE_KEY = 'cart_items';

function loadCartFromStorage(): CartItem[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  isOpen = signal(false);

  notification = signal<string | null>(null);
  private notificationTimeout?: ReturnType<typeof setTimeout>;

  cartItems = signal<CartItem[]>(loadCartFromStorage());

  itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

  subtotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.subtotal, 0));

  total = computed(() => this.subtotal());

  constructor() {
    // Save cart whenever cartItems changes
    effect(() => {
      const items = this.cartItems();

      if (typeof localStorage === 'undefined') {
        return;
      }

      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    });
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((value) => !value);
  }

  showNotification(message: string, duration = 2500): void {
    clearTimeout(this.notificationTimeout);

    this.notification.set(message);

    this.notificationTimeout = setTimeout(() => {
      this.notification.set(null);
    }, duration);
  }

  addItem(newItem: CartItem): void {
    this.cartItems.update((items) => {
      const matchIndex = items.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variantId === newItem.variantId &&
          this.sameAddons(item.addons, newItem.addons),
      );

      // EXISTING ITEM

      if (matchIndex !== -1) {
        const existingItem = items[matchIndex];

        const quantity = existingItem.quantity + newItem.quantity;

        return items.map((item, index) =>
          index === matchIndex
            ? {
                ...item,
                quantity,
                subtotal: this.unitPrice(item) * quantity,
              }
            : item,
        );
      }

      // NEW ITEM

      return [
        ...items,
        {
          ...newItem,
          subtotal: this.unitPrice(newItem) * newItem.quantity,
        },
      ];
    });
  }

  // UNIT PRICE

  private unitPrice(item: CartItem): number {
    const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);

    return item.price + addonsTotal;
  }

  // INCREMENT

  incrementItem(index: number): void {
    const item = this.cartItems()[index];

    if (!item) {
      return;
    }

    this.updateQty(index, item.quantity + 1);
  }

  // DECREMENT

  decrementItem(index: number): void {
    const item = this.cartItems()[index];

    if (!item) {
      return;
    }

    this.updateQty(index, Math.max(1, item.quantity - 1));
  }

  // UPDATE QUANTITY

  private updateQty(index: number, quantity: number): void {
    this.cartItems.update((items) =>
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity,
              subtotal: this.unitPrice(item) * quantity,
            }
          : item,
      ),
    );
  }

  // REMOVE ITEM

  removeItem(index: number): void {
    this.cartItems.update((items) => items.filter((_, i) => i !== index));
  }

  // CLEAR CART

  clearCart(): void {
    this.cartItems.set([]);
  }

  // COMPARE ADDONS

  private sameAddons(a: CartItem['addons'], b: CartItem['addons']): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const key = (addons: CartItem['addons']) =>
      addons
        .map((addon) => `${addon.addonId}:${addon.quantity}`)
        .sort()
        .join(',');

    return key(a) === key(b);
  }
}
