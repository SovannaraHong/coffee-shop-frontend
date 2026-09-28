import { Component, inject } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterModule } from '@angular/router';
import { Footer } from '../footer/footer';
import { Cart } from '../../features/cart/cart';
import { Order } from '../../features/order/order';
import { CartToast } from '../../shared/components/cart-toast/cart-toast';
import { Checkout } from '../../features/checkout/checkout';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  imports: [Navbar, RouterModule, Footer, Cart, Order, CartToast],
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
})
export class MainLayout {
  readonly auth = inject(AuthService);
}
