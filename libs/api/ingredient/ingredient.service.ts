import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { IngredientResponse } from '../../models/ingredient/ingredient-response';
import {
  IngredientCreateRequest,
  IngredientUpdateRequest,
  StockAdjustRequest,
  StockSetRequest,
} from '../../models/ingredient/ingredient-request';

@Injectable({
  providedIn: 'root',
})
export class IngredientApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  // NOTE: the controller is mapped to "api/ingredient" (singular).
  private readonly endpoint = `${this.apiUrl}/ingredient`;

  getAllIngredients(): Observable<IngredientResponse[]> {
    return this.apiClient.get<IngredientResponse[]>(this.endpoint);
  }

  getIngredientById(id: number): Observable<IngredientResponse> {
    return this.apiClient.get<IngredientResponse>(`${this.endpoint}/${id}`);
  }

  getLowStock(): Observable<IngredientResponse[]> {
    return this.apiClient.get<IngredientResponse[]>(`${this.endpoint}/low-stock`);
  }

  createIngredient(request: IngredientCreateRequest): Observable<IngredientResponse> {
    return this.apiClient.post<IngredientResponse>(`${this.endpoint}/create`, request);
  }

  updateIngredient(id: number, request: IngredientUpdateRequest): Observable<IngredientResponse> {
    return this.apiClient.put<IngredientResponse>(`${this.endpoint}/${id}/update`, request);
  }

  deleteIngredient(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  // Stock
  incrementStock(id: number, request: StockAdjustRequest): Observable<IngredientResponse> {
    return this.apiClient.post<IngredientResponse>(
      `${this.endpoint}/${id}/increment-stock`,
      request,
    );
  }

  decrementStock(id: number, request: StockAdjustRequest): Observable<IngredientResponse> {
    return this.apiClient.post<IngredientResponse>(
      `${this.endpoint}/${id}/decrement-stock`,
      request,
    );
  }

  /** Sets the stock to an exact value. */
  adjustStock(id: number, request: StockSetRequest): Observable<IngredientResponse> {
    return this.apiClient.post<IngredientResponse>(`${this.endpoint}/${id}/adjust-stock`, request);
  }

  // Status
  enableIngredient(id: number): Observable<IngredientResponse> {
    return this.apiClient.patch<IngredientResponse>(`${this.endpoint}/${id}/enable`, {});
  }

  disableIngredient(id: number): Observable<IngredientResponse> {
    return this.apiClient.patch<IngredientResponse>(`${this.endpoint}/${id}/disable`, {});
  }
}
