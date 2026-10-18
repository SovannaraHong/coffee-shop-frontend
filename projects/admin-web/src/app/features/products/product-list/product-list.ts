import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Product } from '../../../core/models/product';
import { CategoryService } from '../../../core/services/category-service';
import { ProductService } from '../../../core/services/product-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ProductPayload, ProductDrawer } from '../product-drawer/product-drawer';

type Availability = 'all' | 'available' | 'unavailable';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, ConfirmDialog, ProductDrawer],
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = this.categoryService.items;
  protected readonly pageSize = 8;
  protected readonly availabilityTabs: { value: Availability; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Hidden' },
  ];

  protected readonly search = signal('');
  protected readonly categoryId = signal(0);
  protected readonly availability = signal<Availability>('all');
  protected readonly page = signal(1);
  protected readonly toDelete = signal<Product | null>(null);

  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<Product | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.productService
      .items()
      .filter(
        (p) =>
          (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
          (this.categoryId() === 0 || p.categoryId === this.categoryId()) &&
          (this.availability() === 'all' || (this.availability() === 'available') === p.available),
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
  protected setCategory(v: string): void {
    this.categoryId.set(+v);
    this.page.set(1);
  }
  protected setAvailability(v: Availability): void {
    this.availability.set(v);
    this.page.set(1);
  }
  protected goTo(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pageCount()));
  }

  protected category(id: number) {
    return this.categoryService.getById(id);
  }
  protected margin(p: Product): number {
    return p.price ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
  }
  protected setAvailable(p: Product, available: boolean): void {
    this.productService.update(p.id, { available });
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.showDrawer.set(true);
  }
  protected openEdit(p: Product): void {
    this.editing.set(p);
    this.showDrawer.set(true);
  }

  protected onSaved(v: ProductPayload): void {
    const first = v.variants[0];
    const data = {
      name: v.name,
      description: v.description,
      categoryId: v.categoryId,
      imageUrl: v.imageUrl || undefined,
      available: v.isActive,
      sku: first.sku,
      price: Math.min(...v.variants.map((x) => x.price)),
      cost: 0,
      sizes: v.variants.map((x) => x.name),
    };
    const current = this.editing();
    if (current) this.productService.update(current.id, data);
    else this.productService.add(data);
    this.showDrawer.set(false);
  }

  protected confirmDelete(): void {
    const p = this.toDelete();
    if (p) this.productService.remove(p.id);
    this.toDelete.set(null);
  }
}
