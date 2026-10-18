import { environment } from './../../../projects/admin-web/src/app/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AddonIngredient,
  AddonIngredientInput,
} from '../../models/addon-ingredient/addon-ingredient';

@Injectable({
  providedIn: 'root',
})
export class AddonIngredientService {
  private readonly http = inject(HttpClient);

  private url(addonId: number): string {
    return `${environment.apiUrl}/api/addons/${addonId}/ingredients`;
  }

  // GET: Get all ingredients for an addon
  list(addonId: number): Observable<AddonIngredient[]> {
    return this.http.get<AddonIngredient[]>(this.url(addonId));
  }

  // POST: Add an ingredient to an addon
  add(addonId: number, request: AddonIngredientInput): Observable<AddonIngredient> {
    return this.http.post<AddonIngredient>(this.url(addonId), request);
  }

  // PUT: Update an addon ingredient
  update(addonId: number, id: number, request: AddonIngredientInput): Observable<AddonIngredient> {
    return this.http.put<AddonIngredient>(`${this.url(addonId)}/${id}`, request);
  }

  // DELETE: Remove an ingredient from an addon
  remove(addonId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(addonId)}/${id}`);
  }
}
