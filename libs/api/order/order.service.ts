import { API_URL } from '../api-config';
import { ApiClient } from '../api-client';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OrderCreateRequest } from '../../models/order/order-request.model';
import { Observable } from 'rxjs';
import { OrderResponse } from '../../models/order/order-response.model';
@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/orders`;
  create(request?: OrderCreateRequest): Observable<OrderResponse> {
    return this.apiClient.post<OrderResponse>(`${this.endpoint}`, request);
  }
  findById(id: number): Observable<OrderResponse> {
    return this.apiClient.get<OrderResponse>(`${this.endpoint}/${id}`);
  }

  findByCustomer(customerId: number): Observable<OrderResponse[]> {
    return this.apiClient.get<OrderResponse[]>(`${this.endpoint}/customer/${customerId}`);
  }
}
