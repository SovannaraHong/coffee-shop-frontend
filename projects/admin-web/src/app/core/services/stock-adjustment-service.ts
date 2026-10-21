import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { StockAdjustmentApiService } from '../../../../../../libs/api/stock-adjustment/stock-adjustment.service';
import { PageResponse } from '../../../../../../libs/models/common/page-response.model';
import {
  StockAdjustmentPaginationParams,
  StockAdjustmentResponse,
} from '../../../../../../libs/models/stock-adjustment/stock-adjustment-response.model';

@Injectable({ providedIn: 'root' })
export class StockAdjustmentService {
  private readonly api = inject(StockAdjustmentApiService);

  private readonly _items = signal<StockAdjustmentResponse[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // get all adjustments
  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getAll()));
      return true;
    } catch (error) {
      console.error('Failed to load stock adjustments:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  // get adjustments with pagination
  async loadPage(
    params: StockAdjustmentPaginationParams,
  ): Promise<PageResponse<StockAdjustmentResponse> | null> {
    this._loading.set(true);
    this._error.set(false);
    try {
      return await firstValueFrom(this.api.getPaged(params));
    } catch (error) {
      console.error('Failed to load paginated stock adjustments:', error);
      this._error.set(true);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  // get one adjustment
  async getById(id: number): Promise<StockAdjustmentResponse | null> {
    this._error.set(false);
    try {
      return await firstValueFrom(this.api.getById(id));
    } catch (error) {
      console.error('Failed to get stock adjustment:', error);
      this._error.set(true);
      return null;
    }
  }

  // get the history of one ingredient
  async loadByIngredient(ingredientId: number): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getByIngredient(ingredientId)));
      return true;
    } catch (error) {
      console.error('Failed to load adjustments by ingredient:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }
}
