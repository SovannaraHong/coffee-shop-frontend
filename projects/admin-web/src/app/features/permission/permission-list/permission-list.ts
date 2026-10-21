import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PermissionService } from '../../../core/services/permission-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PermissionResponse } from '../../../../../../../libs/models/permission/permission-response.model';
import { PermissionPayload } from '../../../../../../../libs/models/permission/permission-request.model';
import {
  actionBadge,
  permissionAction,
  permissionModule,
} from '../../../../../../../libs/models/permission/permission.util';
import { PermissionDrawer } from '../permission-drawer/permission-drawer';

@Component({
  selector: 'app-permission-list',
  imports: [ConfirmDialog, PermissionDrawer],
  templateUrl: './permission-list.html',
})
export class PermissionList implements OnInit {
  protected readonly service = inject(PermissionService);

  protected readonly items = this.service.items;
  protected readonly loading = this.service.loading;
  protected readonly saving = this.service.saving;
  protected readonly error = this.service.error;

  protected readonly skeleton = [1, 2, 3, 4, 5];

  // Filters
  protected readonly search = signal('');
  protected readonly module = signal('all');

  // Drawer + delete
  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<PermissionResponse | null>(null);
  protected readonly toDelete = signal<PermissionResponse | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected readonly moduleOf = permissionModule;
  protected readonly actionOf = permissionAction;
  protected readonly badge = actionBadge;

  ngOnInit(): void {
    void this.service.load();
  }

  /** Module tabs with counts */
  protected readonly modules = computed(() => {
    const map = new Map<string, number>();
    for (const p of this.items()) {
      const key = permissionModule(p.name);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  });

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const mod = this.module();

    return this.items()
      .filter((p) => {
        const matchesModule = mod === 'all' || permissionModule(p.name) === mod;
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          (p.description ?? '').toLowerCase().includes(query);
        return matchesModule && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly stats = computed(() => ({
    total: this.items().length,
    modules: this.modules().length,
    noDescription: this.items().filter((p) => !(p.description ?? '').trim()).length,
  }));

  protected readonly hasFilters = computed(() => !!this.search().trim() || this.module() !== 'all');

  protected clearFilters(): void {
    this.search.set('');
    this.module.set('all');
  }

  protected openAdd(): void {
    this.saveError.set(null);
    this.editing.set(null);
    this.showDrawer.set(true);
  }

  protected openEdit(permission: PermissionResponse): void {
    this.saveError.set(null);
    this.editing.set(permission);
    this.showDrawer.set(true);
  }

  protected closeDrawer(): void {
    if (this.saving()) return;
    this.showDrawer.set(false);
    this.editing.set(null);
    this.saveError.set(null);
  }

  protected async onSaved(value: PermissionPayload): Promise<void> {
    if (this.saving()) return;
    this.saveError.set(null);
    this.actionError.set(null);

    const current = this.editing();
    const success = current
      ? await this.service.update(current.id, value)
      : await this.service.add(value);

    if (success) {
      this.showDrawer.set(false);
      this.editing.set(null);
    } else {
      this.saveError.set('Could not save the permission. The name may already exist.');
    }
  }

  protected async confirmDelete(): Promise<void> {
    const permission = this.toDelete();
    if (!permission || this.saving()) return;

    this.actionError.set(null);
    const success = await this.service.remove(permission.id);
    this.toDelete.set(null);

    if (!success) {
      this.actionError.set(
        `Could not delete ${permission.name}. It may still be assigned to a role.`,
      );
    }
  }
}
