import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import { StaffRequest } from '../../models/staff/staff-request.model';
import { StaffResponse } from '../../models/staff/staff-response.model';

@Injectable({
  providedIn: 'root',
})
export class StaffApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/users`;

  // GET /api/users
  getAllStaff(): Observable<StaffResponse[]> {
    return this.apiClient.get<StaffResponse[]>(this.endpoint);
  }

  // POST /api/users
  createStaff(request: StaffRequest): Observable<StaffResponse> {
    return this.apiClient.post<StaffResponse>(this.endpoint, request);
  }

  // PUT /api/users/{id}
  updateStaff(id: number, request: StaffRequest): Observable<StaffResponse> {
    return this.apiClient.put<StaffResponse>(`${this.endpoint}/${id}`, request);
  }

  // PATCH /api/users/{id}/status  (toggles active / inactive)
  changeStaffStatus(id: number): Observable<StaffResponse> {
    return this.apiClient.patch<StaffResponse>(`${this.endpoint}/${id}/status`, {});
  }

  // PATCH /api/users/{id}/unlock
  unlockStaff(id: number): Observable<StaffResponse> {
    return this.apiClient.patch<StaffResponse>(`${this.endpoint}/${id}/unlock`, {});
  }

  // DELETE /api/users/{id}
  deleteStaff(id: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  // PUT /api/users/{id}/image
  uploadStaffImage(id: number, file: File): Observable<StaffResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiClient.put<StaffResponse>(`${this.endpoint}/${id}/image`, formData);
  }
}
