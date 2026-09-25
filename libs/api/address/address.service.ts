import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api-config';
import { ApiClient } from '../api-client';

import { AddressResponse } from '../../models/address/address-response.model';
import {
  AddressCreateRequest,
  AddressUpdateRequest,
} from '../../models/address/address-request.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly apiUrl = inject(API_URL);
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = `${this.apiUrl}/addresses`;

  getByCustomer(customerId: number): Observable<AddressResponse[]> {
    return this.apiClient.get<AddressResponse[]>(`${this.endpoint}/customer/${customerId}`);
  }

  getById(id: number): Observable<AddressResponse> {
    return this.apiClient.get<AddressResponse>(`${this.endpoint}/${id}`);
  }

  create(request: AddressCreateRequest): Observable<AddressResponse> {
    return this.apiClient.post<AddressResponse>(this.endpoint, request);
  }

  update(id: number, request: AddressUpdateRequest): Observable<AddressResponse> {
    return this.apiClient.put<AddressResponse>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
