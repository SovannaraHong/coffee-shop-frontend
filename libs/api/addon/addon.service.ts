import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api-config';
import { ApiClient } from '../api-client';
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
}
