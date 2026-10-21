import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { RoleResponse } from '../../models/role/role-response.model';

@Injectable({ providedIn: 'root' })
export class RoleApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);
  private readonly endpoint = `${this.apiUrl}/roles`;

  getAllRoles(): Observable<RoleResponse[]> {
    return this.apiClient.get<RoleResponse[]>(this.endpoint);
  }
}
