import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { VariantService } from '../../../core/services/variant-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { VariantResponse } from '../../../../../../../libs/models/variant/variant-response.model';
import { VariantDrawer, VariantPayload } from '../variant-drawer/variant-drawer';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-variant-list',
  imports: [CurrencyPipe, PageHeader, ConfirmDialog, VariantDrawer],
  templateUrl: './variant-list.html',
})
export class VariantList implements OnInit {
  protected readonly service = inject(VariantService);

  protected readonly skeleton = [1, 2, 3, 4, 5];
  protected readonly pageSize = 10;

  protected readonly search = signal('');
  protected readonly product = signal('all'); // product name or 'all'
  protected readonly status = signal<StatusFilter>('all');
  protected readonly page = signal(1);

  protected readonly showForm = signal(false);
  protected readonly editing = signal<VariantResponse | null>(null);
  protected readonly toDelete = signal<VariantResponse | null>(null);
  protected readonly togglingId = signal<number | null>(null);

  protected readonly stats = computed(() => {
    const list = this.service.items();
    const active = list.filter((v) => v.isActive).length;
    return { total: list.length, active, inactive: list.length - active };
  });

  /** Product names that actually have variants (for the filter) */
  protected readonly productNames = computed(() =>
    [...new Set(this.service.items().map((v) => v.productName))].sort((a, b) => a.localeCompare(b)),
  );

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.service.items().filter((v) => {
      const matchSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.sku ?? '').toLowerCase().includes(q) ||
        v.productName.toLowerCase().includes(q);
      const matchProduct = this.product() === 'all' || v.productName === this.product();
      const matchStatus = this.status() === 'all' || (this.status() === 'active') === v.isActive;
      return matchSearch && matchProduct && matchStatus;
    });
  });

  protected readonly hasFilters = computed(
    () => !!this.search().trim() || this.product() !== 'all' || this.status() !== 'all',
  );

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1),
  );

  ngOnInit(): void {
    this.service.load();
    this.service.loadProducts();
  }

  protected setSearch(v: string): void {
    this.search.set(v);
    this.page.set(1);
  }

  protected setProduct(v: string): void {
    this.product.set(v);
    this.page.set(1);
  }

  protected setStatus(v: StatusFilter): void {
    this.status.set(this.status() === v ? 'all' : v);
    this.page.set(1);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.product.set('all');
    this.status.set('all');
    this.page.set(1);
  }

  protected goTo(n: number): void {
    this.page.set(Math.min(Math.max(1, n), this.pageCount()));
  }

  protected openAdd(): void {
    this.service.clearError();
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(v: VariantResponse): void {
    this.service.clearError();
    this.editing.set(v);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.service.clearError();
  }

  protected async toggleStatus(v: VariantResponse): Promise<void> {
    if (this.togglingId() !== null) return;
    this.togglingId.set(v.id);
    await this.service.changeStatus(v.id);
    this.togglingId.set(null);
  }

  protected async save(p: VariantPayload): Promise<void> {
    const current = this.editing();
    const request = {
      name: p.name,
      price: p.price,
      sku: p.sku || null,
      isActive: p.isActive,
    };

    const ok = current
      ? await this.service.update(current.id, request)
      : await this.service.add(p.productId, request);

    if (ok) {
      this.showForm.set(false);
      this.editing.set(null);
    }
  }

  protected async confirmDelete(): Promise<void> {
    const v = this.toDelete();
    if (!v) return;
    await this.service.remove(v.id);
    this.toDelete.set(null);
    if (this.page() > this.pageCount()) this.page.set(this.pageCount());
  }
}
