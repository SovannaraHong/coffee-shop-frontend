import { VerifyOtpRequest } from './../otp/otp-api-model';
import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { API_URL } from '../api-config';
import {
  CustomerLoginRequest,
  CustomerRegisterRequest,
  CustomerResponse,
  LoginResponse,
} from './customer-api.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);

  private readonly endpoint = `${this.apiUrl}/auth`;

  login(request: CustomerLoginRequest): Observable<LoginResponse> {
    return this.apiClient.post<LoginResponse>(`${this.endpoint}/login`, request);
  }

  register(request: CustomerRegisterRequest): Observable<CustomerResponse> {
    return this.apiClient.post<CustomerResponse>(`${this.endpoint}/register`, request);
  }
  verifyOtp(request: VerifyOtpRequest): Observable<{ message: string }> {
    return this.apiClient.post<{ message: string }>(`${this.endpoint}/verify-otp`, request);
  }
}
