import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { RoleResponse } from '../../models/role/role-response.model';
import { RoleRequest } from '../../models/role/role-request.model';

@Injectable({ providedIn: 'root' })
export class RoleApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);
  private readonly endpoint = `${this.apiUrl}/roles`;

  getAllRoles(): Observable<RoleResponse[]> {
    return this.apiClient.get<RoleResponse[]>(this.endpoint);
  }
  createRole(request: RoleRequest): Observable<RoleResponse> {
    return this.apiClient.post<RoleResponse>(this.endpoint, request);
  }
  deleteRole(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
  assignPermission(roleId: number, permissionId: number): Observable<RoleResponse> {
    return this.apiClient.post<RoleResponse>(
      `${this.endpoint}/${roleId}/permissions/${permissionId}`,
      {},
    );
  }
  removePermission(roleId: number, permissionId: number): Observable<RoleResponse> {
    return this.apiClient.delete<RoleResponse>(
      `${this.endpoint}/${roleId}/permissions/${permissionId}`,
    );
  }
}
