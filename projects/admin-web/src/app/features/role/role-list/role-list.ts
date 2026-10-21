import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RoleService } from '../../../core/services/role-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { RoleResponse } from '../../../../../../../libs/models/role/role-response.model';
import { RoleDrawer } from '../role-drawer/role-drawer';
import { RolePayload } from '../../../../../../../libs/models/role/role-request.model';

@Component({
  selector: 'app-role-list',
  imports: [ConfirmDialog, RoleDrawer],
  templateUrl: './role-list.html',
})
export class RoleList implements OnInit {
  protected readonly service = inject(RoleService);

  protected readonly roles = this.service.items;
  protected readonly permissions = this.service.permissions;
  protected readonly loading = this.service.loading;
  protected readonly saving = this.service.saving;
  protected readonly error = this.service.error;

  protected readonly skeleton = [1, 2, 3, 4];
  protected readonly maxChips = 4;

  // Filters
  protected readonly search = signal('');

  // Drawer + delete
  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<RoleResponse | null>(null);
  protected readonly toDelete = signal<RoleResponse | null>(null);
  protected readonly saveError = signal<string | null>(null);

  ngOnInit(): void {
    void this.service.load();
    void this.service.loadPermissions();
  }

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.roles().filter(
      (r) =>
        !query ||
        r.name.toLowerCase().includes(query) ||
        (r.permissions ?? []).some((p) => p.name.toLowerCase().includes(query)),
    );
  });

  protected readonly stats = computed(() => {
    const roles = this.roles();
    return {
      total: roles.length,
      permissions: this.permissions().length,
      empty: roles.filter((r) => !(r.permissions?.length ?? 0)).length,
    };
  });

  protected openAdd(): void {
    this.saveError.set(null);
    this.editing.set(null);
    this.showDrawer.set(true);
  }

  protected openEdit(role: RoleResponse): void {
    this.saveError.set(null);
    this.editing.set(role);
    this.showDrawer.set(true);
  }

  protected closeDrawer(): void {
    if (this.saving()) return;
    this.showDrawer.set(false);
    this.editing.set(null);
    this.saveError.set(null);
  }

  protected async onSaved(value: RolePayload): Promise<void> {
    if (this.saving()) return;
    this.saveError.set(null);

    const current = this.editing();
    const success = current
      ? await this.service.updatePermissions(current, value.permissionIds)
      : await this.service.add(value);

    if (success) {
      this.showDrawer.set(false);
      this.editing.set(null);
    } else {
      this.saveError.set('Could not save the role. Please try again.');
    }
  }

  protected async confirmDelete(): Promise<void> {
    const role = this.toDelete();
    if (!role || this.saving()) return;

    const success = await this.service.remove(role.id);
    if (success) {
      this.toDelete.set(null);
    }
  }

  protected permissionCount(role: RoleResponse): number {
    return role.permissions?.length ?? 0;
  }

  protected visiblePermissions(role: RoleResponse) {
    return (role.permissions ?? []).slice(0, this.maxChips);
  }

  protected extraCount(role: RoleResponse): number {
    return Math.max(0, this.permissionCount(role) - this.maxChips);
  }

  protected roleBadge(name: string): string {
    switch (name.toUpperCase()) {
      case 'ADMIN':
        return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'MANAGER':
        return 'bg-sky-50 text-sky-700 ring-sky-200';
      case 'CASHIER':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      default:
        return 'bg-slate-50 text-slate-600 ring-slate-200';
    }
  }
}
