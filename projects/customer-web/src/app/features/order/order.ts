import { OrderService } from './../../../../../../libs/services/order/order.service';
import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-order',
  templateUrl: './order.html',
})
export class Order {
  constructor(public orders: OrderService) {}
}
