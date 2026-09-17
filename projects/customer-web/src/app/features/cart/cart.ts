import { CartService } from './../../../../../../libs/models/cart/cart.service';
import { CartItem } from './../../../../../../libs/models/cart/cart-item.model';
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule],
  selector: 'app-cart',
  templateUrl: './cart.html',
})
export class Cart {
  constructor(public cart: CartService) {}
}
