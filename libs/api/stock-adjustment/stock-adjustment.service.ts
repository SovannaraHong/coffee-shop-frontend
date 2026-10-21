import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { PageResponse } from '../../models/common/page-response.model';
import {
  StockAdjustmentPaginationParams,
  StockAdjustmentResponse,
} from '../../models/stock-adjustment/stock-adjustment-response.model';

@Injectable({
  providedIn: 'root',
})
export class StockAdjustmentApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  // The controller is mapped to "api/stock-adjustment" (singular).
  private readonly endpoint = `${this.apiUrl}/stock-adjustment`;

  getAll(): Observable<StockAdjustmentResponse[]> {
    return this.apiClient.get<StockAdjustmentResponse[]>(this.endpoint);
  }

  getById(id: number): Observable<StockAdjustmentResponse> {
    return this.apiClient.get<StockAdjustmentResponse>(`${this.endpoint}/${id}`);
  }

  getPaged(
    params?: StockAdjustmentPaginationParams,
  ): Observable<PageResponse<StockAdjustmentResponse>> {
    return this.apiClient.get<PageResponse<StockAdjustmentResponse>>(`${this.endpoint}/paged`, {
      params,
    });
  }

  getByIngredient(ingredientId: number): Observable<StockAdjustmentResponse[]> {
    return this.apiClient.get<StockAdjustmentResponse[]>(
      `${this.endpoint}/ingredient/${ingredientId}`,
    );
  }
}
