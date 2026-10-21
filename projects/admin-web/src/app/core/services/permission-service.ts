import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PermissionApiService } from '../../../../../../libs/api/permission/permission.service';
import { PermissionResponse } from '../../../../../../libs/models/permission/permission-response.model';
import { PermissionRequest } from '../../../../../../libs/models/permission/permission-request.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly api = inject(PermissionApiService);

  private readonly _items = signal<PermissionResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      this._items.set(await firstValueFrom(this.api.getAllPermissions()));
      return true;
    } catch (error) {
      console.error('Failed to load permissions:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async add(request: PermissionRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.createPermission(request));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to create permission:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  async update(id: number, request: PermissionRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.updatePermission(id, request));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to update permission:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  async remove(id: number): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.api.deletePermission(id));
      this._items.update((list) => list.filter((p) => p.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete permission:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
