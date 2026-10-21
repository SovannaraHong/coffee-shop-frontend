import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AddonService } from '../../../core/services/addon-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { AddonDrawer } from '../addon-drawer/addon-drawer';
import { AddonFormValue } from '../../../../../../../libs/models/addon/addon-request.model';
import { AddonResponse } from '../../../../../../../libs/models/addon/addon-response.model';

@Component({
  selector: 'app-addon-list',
  imports: [CurrencyPipe, DatePipe, PageHeader, ConfirmDialog, AddonDrawer, RouterLink],
  templateUrl: './addon-list.html',
})
export class AddonList implements OnInit {
  protected readonly service = inject(AddonService);

  protected readonly skeleton = [1, 2, 3, 4, 5];
  protected readonly search = signal('');
  protected readonly tabs: string[] = ['all', 'active', 'inactive'];
  protected readonly tab = signal('all');
  protected readonly showForm = signal(false);
  protected readonly editing = signal<AddonResponse | null>(null);
  protected readonly toDelete = signal<AddonResponse | null>(null);

  protected readonly label: Record<string, string> = {
    all: 'All',
    active: 'Active',
    inactive: 'Inactive',
  };

  protected readonly stats = computed(() => {
    const items = this.service.items();
    const active = items.filter((a) => a.isActive).length;
    return { total: items.length, active, inactive: items.length - active };
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.tab();
    return this.service
      .items()
      .filter((r) => (!q || r.name.toLowerCase().includes(q)) && this.matchesTab(r, t))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  ngOnInit(): void {
    this.service.load();
  }

  private matchesTab(r: AddonResponse, t: string): boolean {
    if (t === 'all') return true;
    return t === 'active' ? r.isActive : !r.isActive;
  }

  protected tabCount(t: string): number {
    return this.service.items().filter((r) => this.matchesTab(r, t)).length;
  }

  protected clearSearch(): void {
    this.search.set('');
  }

  protected clearFilters(): void {
    this.search.set('');
    this.tab.set('all');
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(r: AddonResponse): void {
    this.editing.set(r);
    this.showForm.set(true);
  }

  protected async save(v: AddonFormValue): Promise<void> {
    const current = this.editing();
    const request = { name: v.name, price: v.price };

    if (!current) {
      if (await this.service.add(request)) this.showForm.set(false);
      return;
    }

    const ok = await this.service.update(current.id, request);
    if (!ok) return;

    // Status has its own endpoint, so toggle it only when it changed.
    if (v.isActive !== current.isActive) {
      const toggled = await this.service.changeStatus(current.id);
      if (!toggled) return;
    }
    this.showForm.set(false);
  }

  protected toggleStatus(r: AddonResponse): void {
    this.service.changeStatus(r.id);
  }

  protected async confirmDelete(): Promise<void> {
    const r = this.toDelete();
    if (r) await this.service.remove(r.id);
    this.toDelete.set(null);
  }
}
