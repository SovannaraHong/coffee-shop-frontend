import { InventoryTransactionApiService } from './../../../../../../libs/api/inventory-transaction/inventory-trasaction.service';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { PageResponse } from '../../../../../../libs/models/common/page-response.model';
import {
  TransactionPaginationParams,
  TransactionResponse,
  TransactionType,
} from '../../../../../../libs/models/inventoryTransaction/transaction-response.model';

@Injectable({ providedIn: 'root' })
export class InventoryTransactionService {
  private readonly api = inject(InventoryTransactionApiService);

  // private writable state
  private readonly _items = signal<TransactionResponse[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);

  // public read-only state
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // get all transactions
  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      const transactions = await firstValueFrom(this.api.getAllTransactions());
      this._items.set(transactions);
      return true;
    } catch (error) {
      console.error('Failed to load transactions:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  // get transactions with pagination
  async loadPage(
    params: TransactionPaginationParams,
  ): Promise<PageResponse<TransactionResponse> | null> {
    this._loading.set(true);
    this._error.set(false);
    try {
      return await firstValueFrom(this.api.getTransactions(params));
    } catch (error) {
      console.error('Failed to load paginated transactions:', error);
      this._error.set(true);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  // get transaction by id
  async getById(id: number): Promise<TransactionResponse | null> {
    this._error.set(false);
    try {
      return await firstValueFrom(this.api.getTransactionById(id));
    } catch (error) {
      console.error('Failed to get transaction:', error);
      this._error.set(true);
      return null;
    }
  }

  // get transactions of one ingredient
  async loadByIngredient(ingredientId: number): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getByIngredient(ingredientId)));
      return true;
    } catch (error) {
      console.error('Failed to load transactions by ingredient:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  // get transactions by type
  async loadByType(type: TransactionType): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getByType(type)));
      return true;
    } catch (error) {
      console.error('Failed to load transactions by type:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  // get transactions by date range (ISO date-time strings, e.g. 2026-10-01T00:00:00)
  async loadByDateRange(start: string, end: string): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getByDateRange(start, end)));
      return true;
    } catch (error) {
      console.error('Failed to load transactions by date range:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }
}
