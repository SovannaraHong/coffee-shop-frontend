import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { IngredientApiService } from '../ingredient/ingredient.service';
import { AddonIngredientRequest } from '../../models/addon-ingredient/addon-ingredient-request.model';
import {
  AddonIngredientResponse,
  IngredientOption,
} from '../../models/addon-ingredient/addon-ingredient-response.model';

@Injectable({
  providedIn: 'root',
})
export class AddonIngredientApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);
  private readonly ingredientApi = inject(IngredientApiService);

  private url(addonId: number): string {
    return `${this.apiUrl}/addons/${addonId}/ingredients`;
  }

  getByAddon(addonId: number): Observable<AddonIngredientResponse[]> {
    return this.apiClient.get<AddonIngredientResponse[]>(this.url(addonId));
  }

  create(addonId: number, request: AddonIngredientRequest): Observable<AddonIngredientResponse> {
    return this.apiClient.post<AddonIngredientResponse>(this.url(addonId), request);
  }

  update(
    addonId: number,
    id: number,
    request: AddonIngredientRequest,
  ): Observable<AddonIngredientResponse> {
    return this.apiClient.put<AddonIngredientResponse>(`${this.url(addonId)}/${id}`, request);
  }

  delete(addonId: number, id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.url(addonId)}/${id}`);
  }

  /** Reuses the real ingredient API (GET /api/ingredient) and maps it for the dropdown. */
  getIngredientOptions(): Observable<IngredientOption[]> {
    return this.ingredientApi.getAllIngredients().pipe(
      map((list) =>
        list.map((i) => {
          // Tolerant mapping: adjust once you confirm the field names in IngredientResponse.
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
