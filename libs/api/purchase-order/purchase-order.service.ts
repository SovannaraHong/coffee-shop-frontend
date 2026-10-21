import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { IngredientApiService } from '../ingredient/ingredient.service';
import { PurchaseOrderRequest } from '../../models/purchase-order/purchase-order-request.model';
import {
  IngredientOption,
  PurchaseOrderPage,
  PurchaseOrderPaginationParams,
  PurchaseOrderResponse,
  SupplierOption,
} from '../../models/purchase-order/purchase-order-response.model';

/** Only the fields we need from GET /api/suppliers/all */
interface SupplierDto {
  id: number;
  name: string;
  isActive?: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);
  private readonly ingredientApi = inject(IngredientApiService);

  private readonly endpoint = `${this.apiUrl}/purchase-orders`;

  getPage(params?: PurchaseOrderPaginationParams): Observable<PurchaseOrderPage> {
    return this.apiClient.get<PurchaseOrderPage>(`${this.endpoint}/pagination`, { params });
  }

  getById(id: number): Observable<PurchaseOrderResponse> {
    return this.apiClient.get<PurchaseOrderResponse>(`${this.endpoint}/${id}`);
  }

  create(request: PurchaseOrderRequest): Observable<PurchaseOrderResponse> {
    return this.apiClient.post<PurchaseOrderResponse>(this.endpoint, request);
  }

  update(id: number, request: PurchaseOrderRequest): Observable<PurchaseOrderResponse> {
    return this.apiClient.put<PurchaseOrderResponse>(`${this.endpoint}/${id}`, request);
  }

  placeOrder(id: number): Observable<PurchaseOrderResponse> {
    return this.apiClient.patch<PurchaseOrderResponse>(`${this.endpoint}/${id}/order`, {});
  }

  receive(id: number): Observable<PurchaseOrderResponse> {
    return this.apiClient.patch<PurchaseOrderResponse>(`${this.endpoint}/${id}/receive`, {});
  }

  cancel(id: number): Observable<PurchaseOrderResponse> {
    return this.apiClient.patch<PurchaseOrderResponse>(`${this.endpoint}/${id}/cancel`, {});
  }

  /**
   * GET /api/suppliers/all returns a plain list.
   * (GET /api/suppliers returns a PAGE object, which broke the dropdown.)
   * Only active suppliers can be chosen for a new order.
   */
  getSupplierOptions(): Observable<SupplierOption[]> {
    return this.apiClient
      .get<SupplierDto[]>(`${this.apiUrl}/suppliers/all`)
      .pipe(
        map((list) =>
          (Array.isArray(list) ? list : [])
            .filter((s) => s.isActive !== false)
            .map((s) => ({ id: Number(s.id), name: String(s.name ?? '') })),
        ),
      );
  }

  getIngredientOptions(): Observable<IngredientOption[]> {
    return this.ingredientApi.getAllIngredients().pipe(
      map((list) =>
        (Array.isArray(list) ? list : []).map((i) => {
          const r = i as unknown as Record<string, unknown>;
          return {
            id: Number(r['id']),
            name: String(r['name'] ?? ''),
            unit: String(r['unit'] ?? r['unitName'] ?? ''),
          };
        }),
      ),
    );
  }
}
