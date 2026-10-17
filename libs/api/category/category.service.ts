import { CategoryPaginationParams } from './../../models/category/category.model';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';

import { PageResponse } from '../../models/common/page-response.model';
import { CategoryRequest } from '../../models/category/category-request.model';
import { CategoryResponse } from '../../models/category/category-response.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/categories`;

  // Get categories with pagination and filtering
  getCategories(params?: CategoryPaginationParams): Observable<PageResponse<CategoryResponse>> {
    return this.apiClient.get<PageResponse<CategoryResponse>>(`${this.endpoint}/pagination`, {
      params,
    });
  }
  getAllCategories(): Observable<CategoryResponse[]> {
    return this.apiClient.get<CategoryResponse[]>(this.endpoint);
  }

  // Get category by ID
  getCategoryById(id: number): Observable<CategoryResponse> {
    return this.apiClient.get<CategoryResponse>(`${this.endpoint}/${id}`);
  }

  // Create category
  createCategory(request: CategoryRequest): Observable<CategoryResponse> {
    return this.apiClient.post<CategoryResponse>(this.endpoint, request);
  }

  // Update category
  updateCategory(id: number, request: CategoryRequest): Observable<CategoryResponse> {
    return this.apiClient.put<CategoryResponse>(`${this.endpoint}/${id}`, request);
  }

  // Delete category
  deleteCategory(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  // Upload category image
  uploadCategoryImage(id: number, file: File): Observable<CategoryResponse> {
    const formData = new FormData();

    formData.append('image', file);

    return this.apiClient.patch<CategoryResponse>(`${this.endpoint}/${id}/image`, formData);
  }

  // Change category active status
  changeCategoryStatus(id: number): Observable<CategoryResponse> {
    return this.apiClient.patch<CategoryResponse>(`${this.endpoint}/${id}/stutusChange`, {});
  }

  // Get active categories
  getActiveCategories(): Observable<CategoryResponse[]> {
    return this.apiClient.get<CategoryResponse[]>(`${this.endpoint}/activeCategory`);
  }
}
