import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { ProductApiService } from '../product/product.service';
import { VariantRequest } from '../../models/variant/variant-request.model';
import { ProductOption, VariantResponse } from '../../models/variant/variant-response.model';

@Injectable({ providedIn: 'root' })
export class VariantApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);
  private readonly productApi = inject(ProductApiService);

  // controller is mapped to "api/variant" (singular)
  private readonly endpoint = `${this.apiUrl}/variant`;

  getAll(): Observable<VariantResponse[]> {
    return this.apiClient.get<VariantResponse[]>(this.endpoint);
  }

  getById(id: number): Observable<VariantResponse> {
    return this.apiClient.get<VariantResponse>(`${this.endpoint}/${id}`);
  }

  getByProduct(productId: number): Observable<VariantResponse[]> {
    return this.apiClient.get<VariantResponse[]>(`${this.endpoint}/${productId}/products`);
  }

  create(productId: number, request: VariantRequest): Observable<VariantResponse> {
    return this.apiClient.post<VariantResponse>(`${this.endpoint}/${productId}/variants`, request);
  }

  update(id: number, request: VariantRequest): Observable<VariantResponse> {
    return this.apiClient.put<VariantResponse>(`${this.endpoint}/${id}/update`, request);
  }

  changeStatus(id: number): Observable<VariantResponse> {
    return this.apiClient.patch<VariantResponse>(`${this.endpoint}/${id}/changeStatus`, {});
  }

  /** Backend takes the raw number as the body, e.g. 4.5 */
  changePrice(id: number, price: number): Observable<VariantResponse> {
    return this.apiClient.patch<VariantResponse>(`${this.endpoint}/${id}/changePrice`, price);
  }

  delete(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}/delete`);
  }

  /** Products for the dropdown */
  getProductOptions(): Observable<ProductOption[]> {
    return this.productApi.getAllProducts().pipe(
      map((list) =>
        (Array.isArray(list) ? list : []).map((p) => {
          const r = p as unknown as Record<string, unknown>;
          return { id: Number(r['id']), name: String(r['name'] ?? '') };
        }),
      ),
    );
  }
}
