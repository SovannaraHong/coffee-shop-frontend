import { OrdersService } from './../../../../../../libs/models/order/order.service';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-order',
  templateUrl: './order.html',
})
export class Order {
  constructor(public orders: OrdersService) {}
}
