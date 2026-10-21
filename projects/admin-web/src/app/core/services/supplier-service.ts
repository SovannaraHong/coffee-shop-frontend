import {
  SupplierCreateRequest,
  SupplierUpdateRequest,
} from './../../../../../../libs/models/supplier/supplier-requrest.model';
import { SupplierResponse } from './../../../../../../libs/models/supplier/supplier-response.model';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SupplierApiService } from '../../../../../../libs/api/supplier/supplier.service';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly api = inject(SupplierApiService);

  private readonly _items = signal<SupplierResponse[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getAllSuppliers()));
      return true;
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async add(request: SupplierCreateRequest): Promise<boolean> {
    return this.run('create supplier', async () => {
      await firstValueFrom(this.api.createSupplier(request));
      await this.load();
    });
  }

  async update(id: number, request: SupplierUpdateRequest): Promise<boolean> {
    return this.run('update supplier', async () => {
      await firstValueFrom(this.api.updateSupplier(id, request));
      await this.load();
    });
  }

  async setActive(id: number, active: boolean): Promise<boolean> {
    return this.run('change supplier status', async () => {
      await firstValueFrom(
        active ? this.api.activateSupplier(id) : this.api.deactivateSupplier(id),
      );
      await this.load();
    });
  }

  async remove(id: number): Promise<boolean> {
    return this.run('delete supplier', async () => {
      await firstValueFrom(this.api.deleteSupplier(id));
      this._items.update((list) => list.filter((s) => s.id !== id));
    });
  }

  /** Shared saving/error handling so each action stays short. */
  private async run(label: string, action: () => Promise<void>): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await action();
      return true;
    } catch (error) {
      console.error(`Failed to ${label}:`, error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
