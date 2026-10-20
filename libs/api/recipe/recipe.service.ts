import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { RecipeCreateRequest, RecipeUpdateRequest } from '../../models/recipe/recipe-request.model';
import { RecipeResponse } from '../../models/recipe/recipe-response.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/recipes`;

  // GET /recipes
  getAllRecipes(): Observable<RecipeResponse[]> {
    return this.apiClient.get<RecipeResponse[]>(this.endpoint);
  }

  // GET /recipes/{id}
  getRecipeById(id: number): Observable<RecipeResponse> {
    return this.apiClient.get<RecipeResponse>(`${this.endpoint}/${id}`);
  }

  // GET /recipes/variant/{variantId}
  getRecipeByVariantId(variantId: number): Observable<RecipeResponse> {
    return this.apiClient.get<RecipeResponse>(`${this.endpoint}/variant/${variantId}`);
  }

  // POST /recipes
  createRecipe(request: RecipeCreateRequest): Observable<RecipeResponse> {
    return this.apiClient.post<RecipeResponse>(this.endpoint, request);
  }

  // PUT /recipes/{id}
  updateRecipe(id: number, request: RecipeUpdateRequest): Observable<RecipeResponse> {
    return this.apiClient.put<RecipeResponse>(`${this.endpoint}/${id}`, request);
  }

  // DELETE /recipes/{id}
  deleteRecipe(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
