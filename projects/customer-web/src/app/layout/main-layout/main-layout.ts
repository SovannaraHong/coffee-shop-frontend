import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterModule } from '@angular/router';
import { Footer } from '../footer/footer';
import { Cart } from '../../features/cart/cart';
import { Order } from '../../features/order/order';

@Component({
  imports: [Navbar, RouterModule, Footer, Cart, Order],
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
})
export class MainLayout {}
