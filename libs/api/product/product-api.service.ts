import { ProductRequest } from './../../models/product/product-request.model';
import { ProductResponse } from './../../models/product/product-response.model';
import { PageResponse } from './../../models/common/page-response.model';
import { ProductPaginationParams } from './product-api.model';
import { ApiClient } from './../api-client';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../api-config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/products`;

  getProducts(params?: ProductPaginationParams): Observable<PageResponse<ProductResponse>> {
    return this.apiClient.get<PageResponse<ProductResponse>>(`${this.endpoint}/pagination`, {
      params,
    });
  }
  createProduct(request: ProductRequest): Observable<ProductResponse> {
    return this.apiClient.post<ProductResponse>(`${this.endpoint}/create`, request);
  }
  updateProduct(id: number, request: ProductRequest): Observable<ProductResponse> {
    return this.apiClient.put<ProductResponse>(`${this.endpoint}/${id}/update`, request);
  }
  getProductById(id: number): Observable<ProductResponse> {
    return this.apiClient.get<ProductResponse>(`${this.endpoint}/${id}`);
  }
  getAllProducts(): Observable<ProductResponse[]> {
    return this.apiClient.get<ProductResponse[]>(this.endpoint);
  }
  deleteProduct(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
  changeProductStatus(id: number): Observable<ProductResponse> {
    return this.apiClient.patch<ProductResponse>(`${this.endpoint}/${id}/status`, {});
  }
  getProductsByCategory(categoryId: number): Observable<ProductResponse[]> {
    return this.apiClient.get<ProductResponse[]>(`${this.endpoint}/${categoryId}/category`);
  }
  getFeaturedProducts(): Observable<ProductResponse[]> {
    return this.apiClient.get<ProductResponse[]>(`${this.endpoint}/feature`);
  }
  getNewestProducts(): Observable<ProductResponse[]> {
    return this.apiClient.get<ProductResponse[]>(`${this.endpoint}/new`);
  }
  uploadProductImage(id: number, file: File): Observable<ProductResponse> {
    const formData = new FormData();

    formData.append('file', file);

    return this.apiClient.put<ProductResponse>(`${this.endpoint}/${id}/image`, formData);
  }
}
