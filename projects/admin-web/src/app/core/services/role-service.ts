import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RoleApiService } from '../../../../../../libs/api/role/role.service';
import { PermissionApiService } from '../../../../../../libs/api/permission/permission.service';
import { RoleResponse } from '../../../../../../libs/models/role/role-response.model';
import { PermissionResponse } from '../../../../../../libs/models/permission/permission-response.model';
import { RoleRequest } from '../../../../../../libs/models/role/role-request.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly roleApi = inject(RoleApiService);
  private readonly permissionApi = inject(PermissionApiService);

  // private writable state
  private readonly _items = signal<RoleResponse[]>([]);
  private readonly _permissions = signal<PermissionResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _permissionsLoading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal(false);

  // public read-only state
  readonly items = this._items.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly permissionsLoading = this._permissionsLoading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  // get all roles
  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
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

  // get all permissions (for the drawer)
  async loadPermissions(): Promise<boolean> {
    this._permissionsLoading.set(true);
    try {
      this._permissions.set(await firstValueFrom(this.permissionApi.getAllPermissions()));
      return true;
    } catch (error) {
      console.error('Failed to load permissions:', error);
      this._error.set(true);
      return false;
    } finally {
      this._permissionsLoading.set(false);
    }
  }

  // create role
  async add(request: RoleRequest): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.roleApi.createRole(request));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to create role:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // update role permissions (there is no rename endpoint)
  async updatePermissions(role: RoleResponse, permissionIds: number[]): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);

    const current = new Set((role.permissions ?? []).map((p) => p.id));
    const next = new Set(permissionIds);
    const toAdd = [...next].filter((id) => !current.has(id));
    const toRemove = [...current].filter((id) => !next.has(id));

    try {
      for (const id of toAdd) {
        await firstValueFrom(this.roleApi.assignPermission(role.id, id));
      }
      for (const id of toRemove) {
        await firstValueFrom(this.roleApi.removePermission(role.id, id));
      }
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to update role permissions:', error);
      // some calls may have gone through, so re-sync with the server
      await this.load();
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // remove role
  async remove(id: number): Promise<boolean> {
    this._saving.set(true);
    this._error.set(false);
    try {
      await firstValueFrom(this.roleApi.deleteRole(id));
      this._items.update((roles) => roles.filter((r) => r.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete role:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
