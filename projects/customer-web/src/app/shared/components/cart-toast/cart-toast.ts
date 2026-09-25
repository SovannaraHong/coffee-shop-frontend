import { Component, inject } from '@angular/core';
import { Cart } from '../../../features/cart/cart';
import { CartService } from '../../../../../../../libs/services/cart/cart.service';

@Component({
  imports: [],
  selector: 'app-cart-toast',
  styleUrl: './cart-toast.css',
  templateUrl: './cart-toast.html',
})
export class CartToast {
  cart = inject(CartService);
}
