import { CartService } from './../../../../../../libs/services/cart/cart.service';
import { CartItem } from './../../../../../../libs/models/cart/cart-item.model';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
const CART_STORAGE_KEY = 'cart_items';
function loadCartFromStorage(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}
@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-cart',
  templateUrl: './cart.html',
})
export class Cart {
  constructor(public cart: CartService) {}
}
