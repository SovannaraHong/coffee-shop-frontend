import { AddonRequest } from './../../models/addon/addon-request.model';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { AddonResponse } from '../../models/addon/addon-response.model';

@Injectable({
  providedIn: 'root',
})
export class AddonApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/addons`;

  getAllAddons(): Observable<AddonResponse[]> {
    return this.apiClient.get<AddonResponse[]>(this.endpoint);
  }

  getAddonById(id: number): Observable<AddonResponse> {
    return this.apiClient.get<AddonResponse>(`${this.endpoint}/${id}`);
  }

  createAddon(request: AddonRequest): Observable<AddonResponse> {
    return this.apiClient.post<AddonResponse>(this.endpoint, request);
  }

  updateAddon(id: number, request: AddonRequest): Observable<AddonResponse> {
    return this.apiClient.put<AddonResponse>(`${this.endpoint}/${id}`, request);
  }

  deleteAddon(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  changeAddonStatus(id: number): Observable<AddonResponse> {
    return this.apiClient.patch<AddonResponse>(`${this.endpoint}/${id}/status`, {});
  }
}
