import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AddonApiService } from '../../../../../../libs/api/addon/addon.service';
import { AddonRequest } from '../../../../../../libs/models/addon/addon-request.model';
import { AddonResponse } from '../../../../../../libs/models/addon/addon-response.model';

@Injectable({ providedIn: 'root' })
export class AddonService {
  private readonly api = inject(AddonApiService);

  // private writable state
  private readonly _items = signal<AddonResponse[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);

  // public read-only state
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  // get all add-ons
  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getAllAddons()));
      return true;
    } catch (error) {
      console.error('Failed to load add-ons:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  // get add-on by id
  async getById(id: number): Promise<AddonResponse | null> {
    this._error.set(false);
    try {
      return await firstValueFrom(this.api.getAddonById(id));
    } catch (error) {
      console.error('Failed to get add-on:', error);
      this._error.set(true);
      return null;
    }
  }

  // create add-on
  async add(request: AddonRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.createAddon(request));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to create add-on:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // update add-on
  async update(id: number, request: AddonRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      const updated = await firstValueFrom(this.api.updateAddon(id, request));
      this.replace(updated);
      return true;
    } catch (error) {
      console.error('Failed to update add-on:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // remove add-on
  async remove(id: number): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.deleteAddon(id));
      this._items.update((list) => list.filter((a) => a.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete add-on:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // toggle active / inactive
  async changeStatus(id: number): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      const updated = await firstValueFrom(this.api.changeAddonStatus(id));
      this.replace(updated);
      return true;
    } catch (error) {
      console.error('Failed to change add-on status:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  private replace(updated: AddonResponse): void {
    this._items.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
  }
}
