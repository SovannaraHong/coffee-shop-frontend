import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AddonIngredientApiService } from '../../../../../../libs/api/addon-ingredient/addon-ingredient.service';
import { AddonIngredientRequest } from '../../../../../../libs/models/addon-ingredient/addon-ingredient-request.model';
import {
  AddonIngredientResponse,
  IngredientOption,
} from '../../../../../../libs/models/addon-ingredient/addon-ingredient-response.model';

@Injectable({ providedIn: 'root' })
export class AddonIngredientService {
  private readonly api = inject(AddonIngredientApiService);

  private readonly _items = signal<AddonIngredientResponse[]>([]);
  private readonly _ingredients = signal<IngredientOption[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);

  readonly items = this._items.asReadonly();
  readonly ingredients = this._ingredients.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  // load the ingredients of one add-on
  async load(addonId: number): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getByAddon(addonId)));
      return true;
    } catch (error) {
      console.error('Failed to load add-on ingredients:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  // load all ingredients for the dropdown
  async loadIngredients(): Promise<void> {
    try {
      this._ingredients.set(await firstValueFrom(this.api.getIngredientOptions()));
    } catch (error) {
      console.error('Failed to load ingredients:', error);
      this._error.set(true);
    }
  }

  async add(addonId: number, request: AddonIngredientRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.create(addonId, request));
      await this.load(addonId);
      return true;
    } catch (error) {
      console.error('Failed to add ingredient:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  async update(addonId: number, id: number, request: AddonIngredientRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.update(addonId, id, request));
      await this.load(addonId);
      return true;
    } catch (error) {
      console.error('Failed to update ingredient:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  async remove(addonId: number, id: number): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.delete(addonId, id));
      this._items.update((list) => list.filter((i) => i.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to remove ingredient:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
