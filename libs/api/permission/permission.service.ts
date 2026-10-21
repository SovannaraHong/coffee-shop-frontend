import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { PermissionRequest } from '../../models/permission/permission-request.model';
import { PermissionResponse } from '../../models/permission/permission-response.model';

@Injectable({ providedIn: 'root' })
export class PermissionApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/permissions`;

  getAllPermissions(): Observable<PermissionResponse[]> {
    return this.apiClient.get<PermissionResponse[]>(this.endpoint);
  }
  createPermission(request: PermissionRequest): Observable<PermissionResponse> {
    return this.apiClient.post<PermissionResponse>(this.endpoint, request);
  }
  updatePermission(id: number, request: PermissionRequest): Observable<PermissionResponse> {
    return this.apiClient.put<PermissionResponse>(`${this.endpoint}/${id}`, request);
  }
  deletePermission(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
