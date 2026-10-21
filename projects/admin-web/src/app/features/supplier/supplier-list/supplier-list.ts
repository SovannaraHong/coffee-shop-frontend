import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SupplierService } from '../../../core/services/supplier-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SupplierResponse } from '../../../../../../../libs/models/supplier/supplier-response.model';
import { SupplierDrawer } from '../supplier-drawer/supplier-drawer';
import { SupplierPayload } from '../../../../../../../libs/models/supplier/supplier-requrest.model';

type Tab = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-supplier-list',
  imports: [ConfirmDialog, DatePipe, SupplierDrawer],
  templateUrl: './supplier-list.html',
})
export class SupplierList implements OnInit {
  protected readonly service = inject(SupplierService);

  protected readonly items = this.service.items;
  protected readonly loading = this.service.loading;
  protected readonly saving = this.service.saving;
  protected readonly error = this.service.error;

  protected readonly tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];
  protected readonly skeleton = [1, 2, 3, 4, 5];

  // Filters
  protected readonly search = signal('');
  protected readonly tab = signal<Tab>('all');

  // Pagination
  protected readonly pageSize = 10;
  protected readonly page = signal(1);

  // Drawer + delete
  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<SupplierResponse | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly toDelete = signal<SupplierResponse | null>(null);

  ngOnInit(): void {
    void this.service.load();
  }

  protected readonly stats = computed(() => {
    const all = this.items();
    const active = all.filter((s) => s.isActive).length;
    return { total: all.length, active, inactive: all.length - active };
  });

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const tab = this.tab();

    return this.items().filter((s) => {
      const matchesTab = tab === 'all' || (tab === 'active') === s.isActive;
      const matchesSearch =
        !query ||
        [s.name, s.contactPerson, s.phone, s.email].some((v) =>
          (v ?? '').toLowerCase().includes(query),
        );
      return matchesTab && matchesSearch;
    });
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1),
  );

  protected tabCount(tab: Tab): number {
    const s = this.stats();
    return tab === 'all' ? s.total : tab === 'active' ? s.active : s.inactive;
  }

  // Filter actions
  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected setTab(tab: Tab): void {
    this.tab.set(tab);
    this.page.set(1);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.tab.set('all');
    this.page.set(1);
  }

  protected goTo(page: number): void {
    if (page < 1 || page > this.pageCount()) return;
    this.page.set(page);
  }

  // Drawer
  protected openAdd(): void {
    this.saveError.set(null);
    this.editing.set(null);
    this.showDrawer.set(true);
  }

  protected openEdit(supplier: SupplierResponse): void {
    this.saveError.set(null);
    this.editing.set(supplier);
    this.showDrawer.set(true);
  }

  protected closeDrawer(): void {
    if (this.saving()) return;
    this.showDrawer.set(false);
    this.editing.set(null);
    this.saveError.set(null);
  }

  protected async onSaved(value: SupplierPayload): Promise<void> {
    if (this.saving()) return;
    this.saveError.set(null);

    const current = this.editing();
    let success: boolean;

    if (current) {
      success = await this.service.update(current.id, value);
    } else {
      // Create request has no isActive
      const { isActive: _ignored, ...createRequest } = value;
      success = await this.service.add(createRequest);
    }

    if (success) {
      this.showDrawer.set(false);
      this.editing.set(null);
      if (!current) this.page.set(1);
    } else {
      this.saveError.set('Could not save the supplier. Check the details and try again.');
    }
  }

  // Status toggle
  protected async toggleStatus(supplier: SupplierResponse): Promise<void> {
    if (this.saving()) return;
    await this.service.setActive(supplier.id, !supplier.isActive);
  }

  // Delete
  protected async confirmDelete(): Promise<void> {
    const supplier = this.toDelete();
    if (!supplier || this.saving()) return;

    const success = await this.service.remove(supplier.id);
    if (success) {
      this.toDelete.set(null);
      if (this.page() > this.pageCount()) this.page.set(this.pageCount());
    }
  }
}
