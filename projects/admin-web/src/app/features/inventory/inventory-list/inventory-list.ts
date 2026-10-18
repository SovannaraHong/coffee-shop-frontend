import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  InventoryItem,
  stockStatus,
} from '../../../core/models/inventory-item';
import { InventoryService } from '../../../core/services/inventory-service';
import { SupplierService } from '../../../core/services/supplier-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../../shared/components/modal/modal';

type StockFilter = 'all' | 'low' | 'out';

@Component({
  selector: 'app-inventory-list',
  imports: [ReactiveFormsModule, CurrencyPipe, Modal, ConfirmDialog],
  templateUrl: './inventory-list.html',
})
export class InventoryList {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly inventory = inject(InventoryService);
  protected readonly suppliers = inject(SupplierService).items;

  protected readonly categories = INVENTORY_CATEGORIES;
  protected readonly units = INVENTORY_UNITS;
  protected readonly stockStatus = stockStatus;
  protected readonly pageSize = 8;

  protected readonly search = signal('');
  protected readonly category = signal('all');
  protected readonly stock = signal<StockFilter>('all');
  protected readonly page = signal(1);

  protected readonly showForm = signal(false);
  protected readonly editing = signal<InventoryItem | null>(null);
  protected readonly restocking = signal<InventoryItem | null>(null);
  protected readonly restockQty = signal(1);
  protected readonly toDelete = signal<InventoryItem | null>(null);

  protected readonly total = computed(() => this.inventory.items().length);
  protected readonly lowCount = computed(() => this.inventory.lowStock().length);
  protected readonly outCount = computed(() => this.inventory.outOfStock().length);
  protected readonly stockValue = computed(() =>
    this.inventory.items().reduce((s, i) => s + i.quantity * i.costPerUnit, 0),
  );

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.inventory.items().filter((i) => {
      const status = stockStatus(i);
      return (
        (!q || i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)) &&
        (this.category() === 'all' || i.category === this.category()) &&
        (this.stock() === 'all' ||
          (this.stock() === 'low' ? status === 'Low stock' : status === 'Out of stock'))
      );
    });
  });
  protected readonly paged = computed(() =>
    this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    category: [INVENTORY_CATEGORIES[0] as string, Validators.required],
    unit: ['kg', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]],
    supplierId: [1, Validators.required],
    costPerUnit: [0, [Validators.required, Validators.min(0)]],
  });

  protected setSearch(v: string): void {
    this.search.set(v);
    this.page.set(1);
  }
  protected setCategory(v: string): void {
    this.category.set(v);
    this.page.set(1);
  }
  protected setStock(v: StockFilter): void {
    this.stock.set(v);
    this.page.set(1);
  }

  protected supplierName(id: number): string {
    return this.suppliers().find((s) => s.id === id)?.name ?? '—';
  }
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );
  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, n) => n + 1),
  );

  protected goTo(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pageCount()));
  }
  /** Bar fills up to 2× the reorder level */
  protected percent(i: InventoryItem): number {
    return i.reorderLevel
      ? Math.min(100, Math.round((i.quantity / (i.reorderLevel * 2)) * 100))
      : 100;
  }
  protected barClass(i: InventoryItem): string {
    const s = stockStatus(i);
    return s === 'In stock' ? 'bg-emerald-500' : s === 'Low stock' ? 'bg-amber-500' : 'bg-red-500';
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.form.reset({
      name: '',
      category: INVENTORY_CATEGORIES[0],
      unit: 'kg',
      quantity: 0,
      reorderLevel: 0,
      supplierId: this.suppliers()[0]?.id ?? 1,
      costPerUnit: 0,
    });
    this.showForm.set(true);
  }
  protected openEdit(i: InventoryItem): void {
    this.editing.set(i);
    this.form.reset({
      name: i.name,
      category: i.category,
      unit: i.unit,
      quantity: i.quantity,
      reorderLevel: i.reorderLevel,
      supplierId: i.supplierId,
      costPerUnit: i.costPerUnit,
    });
    this.showForm.set(true);
  }
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const data = {
      ...v,
      category: v.category as InventoryItem['category'],
      supplierId: +v.supplierId,
    };
    const current = this.editing();
    if (current) this.inventory.update(current.id, data);
    else {
      const code = `ING-${String(this.total() + 1).padStart(3, '0')}`;
      this.inventory.add({ ...data, code, lastRestocked: new Date().toISOString().slice(0, 10) });
    }
    this.showForm.set(false);
  }

  protected openRestock(i: InventoryItem): void {
    this.restockQty.set(1);
    this.restocking.set(i);
  }
  protected confirmRestock(): void {
    const i = this.restocking();
    if (i && this.restockQty() > 0) this.inventory.restock(i.id, this.restockQty());
    this.restocking.set(null);
  }
  protected confirmDelete(): void {
    const i = this.toDelete();
    if (i) this.inventory.remove(i.id);
    this.toDelete.set(null);
  }
}
