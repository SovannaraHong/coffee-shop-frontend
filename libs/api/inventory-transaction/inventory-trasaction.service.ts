import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { PageResponse } from '../../models/common/page-response.model';
import {
  TransactionPaginationParams,
  TransactionResponse,
  TransactionType,
} from '../../models/inventoryTransaction/transaction-response.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryTransactionApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/transactions`;

  getAllTransactions(): Observable<TransactionResponse[]> {
    return this.apiClient.get<TransactionResponse[]>(this.endpoint);
  }

  getTransactionById(id: number): Observable<TransactionResponse> {
    return this.apiClient.get<TransactionResponse>(`${this.endpoint}/${id}`);
  }

  getTransactions(
    params?: TransactionPaginationParams,
  ): Observable<PageResponse<TransactionResponse>> {
    return this.apiClient.get<PageResponse<TransactionResponse>>(`${this.endpoint}/pagination`, {
      params,
    });
  }

  getByIngredient(ingredientId: number): Observable<TransactionResponse[]> {
    return this.apiClient.get<TransactionResponse[]>(`${this.endpoint}/ingredient/${ingredientId}`);
  }

  getByType(type: TransactionType): Observable<TransactionResponse[]> {
    return this.apiClient.get<TransactionResponse[]>(`${this.endpoint}/type/${type}`);
  }

  getByDateRange(start: string, end: string): Observable<TransactionResponse[]> {
    return this.apiClient.get<TransactionResponse[]>(`${this.endpoint}/date-range`, {
      params: { start, end },
    });
  }
}
