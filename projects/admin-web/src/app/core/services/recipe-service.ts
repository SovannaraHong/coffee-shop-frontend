import { firstValueFrom } from 'rxjs';
import { RecipeResponse } from '../../../../../../libs/models/recipe/recipe-response.model';
import { RecipeApiService } from './../../../../../../libs/api/recipe/recipe.service';
import { inject, Injectable, signal } from '@angular/core';
import {
  RecipeCreateRequest,
  RecipeUpdateRequest,
} from '../../../../../../libs/models/recipe/recipe-request.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly api = inject(RecipeApiService);

  private readonly _items = signal<RecipeResponse[]>([]);
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
      this._items.set(await firstValueFrom(this.api.getAllRecipes()));
    } catch {
      this._error.set('Could not load recipes.');
    } finally {
      this._loading.set(false);
    }
  }
  async add(request: RecipeCreateRequest): Promise<boolean> {
    this._saving.set(true);
    try {
      const created = await firstValueFrom(this.api.createRecipe(request));
      this._items.update((list) => [...list, created]);
      return true;
    } catch {
      return false;
    } finally {
      this._saving.set(false);
    }
  }
  async update(id: number, request: RecipeUpdateRequest): Promise<boolean> {
    this._saving.set(true);
    try {
      const updated = await firstValueFrom(this.api.updateRecipe(id, request));
      this._items.update((list) => list.map((r) => (r.id === id ? updated : r)));
      return true;
    } catch {
      return false;
    } finally {
      this._saving.set(false);
    }
  }
  async remove(id: number): Promise<boolean> {
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.deleteRecipe(id));
      this._items.update((list) => list.filter((r) => r.id !== id));
      return true;
    } catch {
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
