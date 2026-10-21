import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClient } from '../../../../../../libs/api/api-client';
import { API_URL } from '../../../../../../libs/api/api-config';
import { PaymentResponse } from '../../../../../../libs/models/payment/payment-response';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);
  private readonly endpoint = `${this.apiUrl}/payments`;

  private readonly _items = signal<PaymentResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** GET /api/payments/all (requires PAYMENT_MANAGE) */
  async load(): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const data = await firstValueFrom(this.api.get<PaymentResponse[]>(`${this.endpoint}/all`));
      this._items.set(data ?? []);
      return true;
    } catch (e) {
      console.error('Failed to load payments:', e);
      this._error.set('Failed to load payments');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  /** GET /api/payments/{id}/status */
  async checkStatus(paymentId: number): Promise<PaymentResponse | null> {
    try {
      const updated = await firstValueFrom(
        this.api.get<PaymentResponse>(`${this.endpoint}/${paymentId}/status`),
      );
      if (updated) {
        this._items.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      }
      return updated;
    } catch (e) {
      console.error('Failed to check payment status:', e);
      return null;
    }
  }

  /** POST /api/payments/khqr/{orderId} */
  async initiateKhqr(
    orderId: number,
  ): Promise<{ payment: PaymentResponse; checkoutUrl: string; qrString: string } | null> {
    try {
      return await firstValueFrom(
        this.api.post<{ payment: PaymentResponse; checkoutUrl: string; qrString: string }>(
          `${this.endpoint}/khqr/${orderId}`,
          {},
        ),
      );
    } catch (e) {
      console.error('Failed to initiate KHQR payment:', e);
      return null;
    }
  }
}
