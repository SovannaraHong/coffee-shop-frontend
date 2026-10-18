import { Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
  { path: '', title: 'Orders · Brewly', loadComponent: () => import('./order-list/order-list').then((m) => m.OrderList) },
  { path: ':id', title: 'Order details · Brewly', loadComponent: () => import('./order-detail/order-detail').then((m) => m.OrderDetail) },
];
