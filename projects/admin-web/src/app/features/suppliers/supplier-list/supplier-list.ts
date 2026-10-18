import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Supplier } from '../../../core/models/supplier';
import { InventoryService } from '../../../core/services/inventory-service';
import { SupplierService } from '../../../core/services/supplier-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { initials, statusClass } from '../../../shared/utils/status-style';
import { SupplierDrawer, SupplierPayload } from '../supplier-drawer/supplier-drawer';

type StatusFilter = 'all' | 'Active' | 'Inactive';

@Component({
  selector: 'app-supplier-list',
  imports: [DatePipe, ConfirmDialog, SupplierDrawer],
  templateUrl: './supplier-list.html',
})
export class SupplierList {
  private readonly service = inject(SupplierService);
  private readonly inventory = inject(InventoryService);

  protected readonly pageSize = 8;
  protected readonly search = signal('');
  protected readonly status = signal<StatusFilter>('all');
  protected readonly page = signal(1);

  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<Supplier | null>(null);
  protected readonly toDelete = signal<Supplier | null>(null);

  protected readonly statusClass = statusClass;
  protected readonly initials = initials;

  protected readonly statusTabs = computed(() => {
    const all = this.service.items();
    return [
      { value: 'all' as StatusFilter, label: 'All', count: all.length },
      {
        value: 'Active' as StatusFilter,
        label: 'Active',
        count: all.filter((s) => s.status === 'Active').length,
      },
      {
        value: 'Inactive' as StatusFilter,
        label: 'Inactive',
        count: all.filter((s) => s.status === 'Inactive').length,
      },
    ];
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.service
      .items()
      .filter(
        (s) =>
          (this.status() === 'all' || s.status === this.status()) &&
          (!q ||
            s.name.toLowerCase().includes(q) ||
            s.contact.toLowerCase().includes(q) ||
            s.supplies.toLowerCase().includes(q)),
      );
  });
  protected readonly paged = computed(() =>
    this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );
  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, n) => n + 1),
  );

  protected setSearch(v: string): void {
    this.search.set(v);
    this.page.set(1);
  }
  protected setStatus(v: StatusFilter): void {
    this.status.set(v);
    this.page.set(1);
  }
  protected goTo(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pageCount()));
  }

  protected itemCount(id: number): number {
    return this.inventory.items().filter((i) => i.supplierId === id).length;
  }
  /** "Espresso beans, single origin" → ['Espresso beans', 'single origin'] (max 3 chips) */
  protected tags(text: string): string[] {
    return text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.showDrawer.set(true);
  }
  protected openEdit(s: Supplier): void {
    this.editing.set(s);
    this.showDrawer.set(true);
  }

  protected onSaved(v: SupplierPayload): void {
    const current = this.editing();
    if (current) this.service.update(current.id, v);
    else this.service.add({ ...v, lastDelivery: new Date().toISOString().slice(0, 10) });
    this.showDrawer.set(false);
  }

  protected confirmDelete(): void {
    const s = this.toDelete();
    if (s) this.service.remove(s.id);
    this.toDelete.set(null);
  }
}
