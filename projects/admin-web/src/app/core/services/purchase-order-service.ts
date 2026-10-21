import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { PurchaseOrderApiService } from '../../../../../../libs/api/purchase-order/purchase-order.service';
import { PurchaseOrderRequest } from '../../../../../../libs/models/purchase-order/purchase-order-request.model';
import {
  IngredientOption,
  PurchaseOrderResponse,
  SupplierOption,
} from '../../../../../../libs/models/purchase-order/purchase-order-response.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly api = inject(PurchaseOrderApiService);

  private readonly _items = signal<PurchaseOrderResponse[]>([]);
  private readonly _suppliers = signal<SupplierOption[]>([]);
  private readonly _ingredients = signal<IngredientOption[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);

  readonly items = this._items.asReadonly();
  readonly suppliers = this._suppliers.asReadonly();
  readonly ingredients = this._ingredients.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      const page = await firstValueFrom(this.api.getPage({ page: 0, size: 200 }));
      this._items.set(page.content ?? []);
      return true;
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async loadOptions(): Promise<void> {
    // load separately so one failure does not block the other
    try {
      const suppliers = await firstValueFrom(this.api.getSupplierOptions());
      this._suppliers.set(Array.isArray(suppliers) ? suppliers : []);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      this._suppliers.set([]);
      this._error.set(true);
    }

    try {
      const ingredients = await firstValueFrom(this.api.getIngredientOptions());
      this._ingredients.set(Array.isArray(ingredients) ? ingredients : []);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
      this._ingredients.set([]);
      this._error.set(true);
    }
  }

  async add(request: PurchaseOrderRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.create(request));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  async update(id: number, request: PurchaseOrderRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.update(id, request));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to update purchase order:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  placeOrder(id: number): Promise<boolean> {
    return this.changeState(id, this.api.placeOrder(id), 'place order');
  }

  receive(id: number): Promise<boolean> {
    return this.changeState(id, this.api.receive(id), 'receive order');
  }

  cancel(id: number): Promise<boolean> {
    return this.changeState(id, this.api.cancel(id), 'cancel order');
  }

  private async changeState(
    id: number,
    request$: Observable<PurchaseOrderResponse>,
    action: string,
  ): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      const updated = await firstValueFrom(request$);
      this._items.update((list) => list.map((o) => (o.id === id ? updated : o)));
      return true;
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      await this.load();
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
