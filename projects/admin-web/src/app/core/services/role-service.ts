import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RoleApiService } from '../../../../../../libs/api/role/role.service';
import { RoleResponse } from '../../../../../../libs/models/role/role-response.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly roleApi = inject(RoleApiService);

  private readonly _items = signal<RoleResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<boolean> {
    this._loading.set(true);
    this._error.set(false);
    try {
      this._items.set(await firstValueFrom(this.roleApi.getAllRoles()));
      return true;
    } catch (error) {
      console.error('Failed to load roles:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }
}
