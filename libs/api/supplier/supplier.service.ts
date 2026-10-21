import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './../api-client';
import { API_URL } from '../api-config';
import { SupplierResponse } from '../../models/supplier/supplier-response.model';
import {
  SupplierCreateRequest,
  SupplierUpdateRequest,
} from '../../models/supplier/supplier-requrest.model';

@Injectable({ providedIn: 'root' })
export class SupplierApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/suppliers`;

  getAllSuppliers(): Observable<SupplierResponse[]> {
    return this.apiClient.get<SupplierResponse[]>(`${this.endpoint}/all`);
  }
  getSupplierById(id: number): Observable<SupplierResponse> {
    return this.apiClient.get<SupplierResponse>(`${this.endpoint}/${id}`);
  }
  createSupplier(request: SupplierCreateRequest): Observable<SupplierResponse> {
    return this.apiClient.post<SupplierResponse>(this.endpoint, request);
  }
  updateSupplier(id: number, request: SupplierUpdateRequest): Observable<SupplierResponse> {
    return this.apiClient.put<SupplierResponse>(`${this.endpoint}/${id}`, request);
  }
  activateSupplier(id: number): Observable<void> {
    return this.apiClient.patch<void>(`${this.endpoint}/${id}/activate`, {});
  }
  deactivateSupplier(id: number): Observable<void> {
    return this.apiClient.patch<void>(`${this.endpoint}/${id}/deactivate`, {});
  }
  deleteSupplier(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
