import { OrderAction } from './../../models/order/order-action';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './../api-client';
import { API_URL } from '../api-config';
import { OrderCreateRequest } from '../../models/order/order-request.model';
import { OrderResponse } from '../../models/order/order-response.model';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/orders`;

  // ---------- Read ----------

  getAllOrders(): Observable<OrderResponse[]> {
    return this.apiClient.get<OrderResponse[]>(`${this.endpoint}/all`);
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.apiClient.get<OrderResponse>(`${this.endpoint}/${id}`);
  }

  getOrdersByCustomer(customerId: number): Observable<OrderResponse[]> {
    return this.apiClient.get<OrderResponse[]>(`${this.endpoint}/customer/${customerId}`);
  }

  // ---------- Create ----------

  createOrder(request: OrderCreateRequest): Observable<OrderResponse> {
    return this.apiClient.post<OrderResponse>(this.endpoint, request);
  }

  // ---------- Status (one method per backend endpoint) ----------

  confirm(id: number): Observable<OrderResponse> {
    return this.apiClient.patch<OrderResponse>(`${this.endpoint}/${id}/confirm`, {});
  }

  cancel(id: number): Observable<OrderResponse> {
    return this.apiClient.patch<OrderResponse>(`${this.endpoint}/${id}/cancel`, {});
  }

  markPreparing(id: number): Observable<OrderResponse> {
    return this.apiClient.patch<OrderResponse>(`${this.endpoint}/${id}/preparing`, {});
  }

  markReady(id: number): Observable<OrderResponse> {
    return this.apiClient.patch<OrderResponse>(`${this.endpoint}/${id}/ready`, {});
  }

  markDelivering(id: number): Observable<OrderResponse> {
    return this.apiClient.patch<OrderResponse>(`${this.endpoint}/${id}/delivering`, {});
  }

  complete(id: number): Observable<OrderResponse> {
    return this.apiClient.patch<OrderResponse>(`${this.endpoint}/${id}/complete`, {});
  }

  /** Picks the right method above, so the UI can work with one `OrderAction`. */
  changeStatus(id: number, action: OrderAction): Observable<OrderResponse> {
    switch (action) {
      case 'confirm':
        return this.confirm(id);
      case 'preparing':
        return this.markPreparing(id);
      case 'ready':
        return this.markReady(id);
      case 'delivering':
        return this.markDelivering(id);
      case 'complete':
        return this.complete(id);
      case 'cancel':
        return this.cancel(id);
    }
  }
}
