import { Component, computed, inject, signal } from '@angular/core';
// Adjust these paths to your tsconfig alias or relative location of libs/models

import { CategoryService } from '../../../core/services/category-service';
import { ProductService } from '../../../core/services/product-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CategoryResponse } from '../../../../../../../libs/models/category/category-response.model';
import { CategoryRequest } from '../../../../../../../libs/models/category/category-request.model';
import { CategoryDrawer } from '../category-drawer/category-drawer';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-category-list',
  imports: [ConfirmDialog, CategoryDrawer],
  templateUrl: './category-list.html',
})
export class CategoryList {
  private readonly categoryService = inject(CategoryService);
  private readonly products = inject(ProductService);

  protected readonly statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  protected readonly search = signal('');
  protected readonly status = signal<StatusFilter>('all');

  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<CategoryResponse | null>(null);
  protected readonly toDelete = signal<CategoryResponse | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.categoryService
      .items()
      .filter(
        (c: CategoryResponse) =>
          (!q ||
            c.name.toLowerCase().includes(q) ||
            (c.description ?? '').toLowerCase().includes(q)) &&
          (this.status() === 'all' || (this.status() === 'active') === c.isActive),
      );
  });

  protected readonly counts = computed(() => {
    const map = new Map<number, number>();
    for (const p of this.products.items()) map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
    return map;
  });

  protected openAdd(): void {
    this.editing.set(null);
    this.showDrawer.set(true);
  }
  protected openEdit(c: CategoryResponse): void {
    this.editing.set(c);
    this.showDrawer.set(true);
  }

  protected onSaved(v: CategoryRequest): void {
    const current = this.editing();
    if (current) this.categoryService.update(current.id, v);
    else this.categoryService.add(v);
    this.showDrawer.set(false);
  }

  protected confirmDelete(): void {
    const c = this.toDelete();
    if (c) this.categoryService.remove(c.id);
    this.toDelete.set(null);
  }
}
