import { Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    title: 'Orders · Brewly',
    loadComponent: () => import('./order-list/order-list').then((m) => m.OrderList),
  },
];
