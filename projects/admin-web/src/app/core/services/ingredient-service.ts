import { IngredientApiService } from './../../../../../../libs/api/ingredient/ingredient.service';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { IngredientResponse } from '../../../../../../libs/models/ingredient/ingredient-response';
import {
  IngredientCreateRequest,
  IngredientUpdateRequest,
  StockAdjustRequest,
  StockSetRequest,
} from '../../../../../../libs/models/ingredient/ingredient-request';

/** State + signals for the ingredient page. All HTTP lives in IngredientApiService. */
@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly api = inject(IngredientApiService);

  private readonly _items = signal<IngredientResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      this._items.set(await firstValueFrom(this.api.getAllIngredients()));
    } catch {
      this._error.set('Could not load ingredients.');
    } finally {
      this._loading.set(false);
    }
  }

  async add(request: IngredientCreateRequest): Promise<boolean> {
    return this.run(async () => {
      const created = await firstValueFrom(this.api.createIngredient(request));
      this._items.update((list) => [...list, created]);
    });
  }

  async update(id: number, request: IngredientUpdateRequest): Promise<boolean> {
    return this.replaceWith(this.api.updateIngredient(id, request));
  }

  async remove(id: number): Promise<boolean> {
    return this.run(async () => {
      await firstValueFrom(this.api.deleteIngredient(id));
      this._items.update((list) => list.filter((i) => i.id !== id));
    });
  }

  async setActive(id: number, active: boolean): Promise<boolean> {
    return this.replaceWith(
      active ? this.api.enableIngredient(id) : this.api.disableIngredient(id),
    );
  }

  async increaseStock(id: number, request: StockAdjustRequest): Promise<boolean> {
    return this.replaceWith(this.api.incrementStock(id, request));
  }

  async decreaseStock(id: number, request: StockAdjustRequest): Promise<boolean> {
    return this.replaceWith(this.api.decrementStock(id, request));
  }

  async setStock(id: number, request: StockSetRequest): Promise<boolean> {
    return this.replaceWith(this.api.adjustStock(id, request));
  }

  // helpers
  private replaceWith(request$: Observable<IngredientResponse>): Promise<boolean> {
    return this.run(async () => {
      const updated = await firstValueFrom(request$);
      this._items.update((list) => list.map((i) => (i.id === updated.id ? updated : i)));
    });
  }

  private async run(action: () => Promise<void>): Promise<boolean> {
    this._saving.set(true);
    try {
      await action();
      return true;
    } catch {
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
