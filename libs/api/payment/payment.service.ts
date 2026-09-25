import { PaymentResponse } from './../../models/payment/payment-response';
import { KhqrPaymentResult } from './../../models/payment/payment-request';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../projects/customer-web/src/app/environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  initiateKhqrPayment(orderId: number): Observable<KhqrPaymentResult> {
    return this.http.post<KhqrPaymentResult>(`${this.baseUrl}/khqr/${orderId}`, {});
  }

  checkStatus(paymentId: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.baseUrl}/${paymentId}/status`);
  }
}
