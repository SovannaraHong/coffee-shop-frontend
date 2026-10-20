import { OrderApiService } from './../../../../../../libs/api/order/order.service';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Order, OrderStatus } from '../models/order';
import { OrderResponse } from '../../../../../../libs/models/order/order-response.model';
import { firstValueFrom } from 'rxjs';
import { OrderAction } from '../../../../../../libs/models/order/order-action';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly orderApi = inject(OrderApiService);

  private readonly _items = signal<OrderResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal(false);

  // id of the order currently changing status (null = none)
  private readonly _busyId = signal<number | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly busyId = this._busyId.asReadonly();

  /** silent = background refresh (no spinner flash, no error banner). */
  async load(silent = false): Promise<boolean> {
    if (!silent) {
      this._error.set(false);
      this._loading.set(true);
    }
    try {
      this._items.set(await firstValueFrom(this.orderApi.getAllOrders()));
      return true;
    } catch (error) {
      console.error('Failed to load orders:', error);
      if (!silent) this._error.set(true);
      return false;
    } finally {
      if (!silent) this._loading.set(false);
    }
  }

  /** Move an order to a new status and patch it locally (no full reload). */
  async changeStatus(id: number, action: OrderAction): Promise<OrderResponse | null> {
    if (this._busyId() !== null) return null;
    this._error.set(false);
    this._busyId.set(id);
    try {
      const updated = await firstValueFrom(this.orderApi.changeStatus(id, action));
      this._items.update((list) => list.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      return updated;
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
      this._error.set(true);
      // Someone else may have changed it already: resync.
      await this.load(true);
      return null;
    } finally {
      this._busyId.set(null);
    }
  }
}
