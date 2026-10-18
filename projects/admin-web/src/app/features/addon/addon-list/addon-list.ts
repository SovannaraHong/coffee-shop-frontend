import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AddonService } from '../../../core/services/addon-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { AddonDrawer } from '../addon-drawer/addon-drawer';
import { Addon, AddonInput } from '../../../../../../../libs/models/addon/addon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-addon-list',
  imports: [CurrencyPipe, DatePipe, PageHeader, ConfirmDialog, AddonDrawer, RouterLink],
  templateUrl: './addon-list.html',
})
export class AddonList {
  private readonly service = inject(AddonService);

  protected readonly search = signal('');
  protected readonly tabs: string[] = ['all', 'Active', 'Inactive'];
  protected readonly tab = signal('all');
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Addon | null>(null);
  protected readonly toDelete = signal<Addon | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.tab();
    return this.service.items().filter(
      (r) =>
        (!q ||
          [r.name, r.createdBy].some((v) =>
            String(v ?? '')
              .toLowerCase()
              .includes(q),
          )) &&
        this.matchesTab(r, t),
    );
  });

  private matchesTab(r: Addon, t: string): boolean {
    if (t === 'all') return true;
    return t === 'Active' ? r.isActive : !r.isActive;
  }

  protected tabCount(t: string): number {
    return this.service.items().filter((r) => this.matchesTab(r, t)).length;
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(r: Addon): void {
    this.editing.set(r);
    this.showForm.set(true);
  }

  protected save(v: AddonInput): void {
    const current = this.editing();
    if (current) this.service.update(current.id, v);
    else this.service.add(v);
    this.showForm.set(false);
  }

  protected confirmDelete(): void {
    const r = this.toDelete();
    if (r) this.service.remove(r.id);
    this.toDelete.set(null);
  }
}
