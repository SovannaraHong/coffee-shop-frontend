import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { VariantApiService } from '../../../../../../libs/api/variant/variant.service';
import { VariantRequest } from '../../../../../../libs/models/variant/variant-request.model';
import {
  ProductOption,
  VariantResponse,
} from '../../../../../../libs/models/variant/variant-response.model';

@Injectable({ providedIn: 'root' })
export class VariantService {
  private readonly api = inject(VariantApiService);

  private readonly _items = signal<VariantResponse[]>([]);
  private readonly _products = signal<ProductOption[]>([]);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<boolean> {
    this._error.set(null);
    this._loading.set(true);
    try {
      const list = await firstValueFrom(this.api.getAll());
      this._items.set(Array.isArray(list) ? list : []);
      return true;
    } catch (e) {
      console.error('Failed to load variants:', e);
      this._error.set(this.message(e));
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async loadProducts(): Promise<void> {
    try {
      const list = await firstValueFrom(this.api.getProductOptions());
      this._products.set(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load products:', e);
      this._products.set([]);
      this._error.set(this.message(e));
    }
  }

  add(productId: number, request: VariantRequest): Promise<boolean> {
    return this.run('create variant', async () => {
      await firstValueFrom(this.api.create(productId, request));
      await this.load();
    });
  }

  update(id: number, request: VariantRequest): Promise<boolean> {
    return this.run('update variant', async () => {
      await firstValueFrom(this.api.update(id, request));
      await this.load();
    });
  }

  changeStatus(id: number): Promise<boolean> {
    return this.run('change status', async () => {
      const updated = await firstValueFrom(this.api.changeStatus(id));
      this._items.update((list) => list.map((v) => (v.id === id ? updated : v)));
    });
  }

  remove(id: number): Promise<boolean> {
    return this.run('delete variant', async () => {
      await firstValueFrom(this.api.delete(id));
      this._items.update((list) => list.filter((v) => v.id !== id));
    });
  }

  clearError(): void {
    this._error.set(null);
  }

  private async run(action: string, fn: () => Promise<void>): Promise<boolean> {
    this._error.set(null);
    this._saving.set(true);
    try {
      await fn();
      return true;
    } catch (e) {
      console.error(`Failed to ${action}:`, e);
      this._error.set(this.message(e));
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  /** Shows the backend message when there is one */
  private message(e: unknown): string {
    const err = e as { error?: { message?: string } };
    return err?.error?.message ?? 'Something went wrong. Please try again.';
  }
}
