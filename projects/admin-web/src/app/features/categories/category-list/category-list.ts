import { Component, computed, inject, signal } from '@angular/core';
// Adjust these paths to your tsconfig alias or relative location of libs/models

import { CategoryService } from '../../../core/services/category-service';
import { ProductService } from '../../../core/services/product-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CategoryResponse } from '../../../../../../../libs/models/category/category-response.model';
import {
  CategoryFormSubmit,
  CategoryRequest,
} from '../../../../../../../libs/models/category/category-request.model';
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

  protected readonly items = this.categoryService.items;
  protected readonly loading = this.categoryService.loading;
  protected readonly saving = this.categoryService.saving;
  protected readonly error = this.categoryService.error;

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
    const status = this.status();

    return this.items().filter((category) => {
      const matchesSearch =
        !q ||
        category.name.toLowerCase().includes(q) ||
        (category.description ?? '').toLowerCase().includes(q);
      const matchesStatus = status === 'all' || category.isActive === (status === 'active');

      return matchesSearch && matchesStatus;
    });
  });

  protected readonly counts = computed(() => {
    const map = new Map<number, number>();

    for (const product of this.products.items()) {
      map.set(product.categoryId, (map.get(product.categoryId) ?? 0) + 1);
    }
    return map;
  });
  constructor() {
    void this.categoryService.load();
  }
  protected openAdd(): void {
    this.editing.set(null);
    this.categoryService.clearError();
    this.showDrawer.set(true);
  }
  protected openEdit(c: CategoryResponse): void {
    this.editing.set(c);
    this.categoryService.clearError();
    this.showDrawer.set(true);
  }

  protected async onSaved(value: CategoryFormSubmit): Promise<void> {
    if (this.saving()) return;
    const current = this.editing();

    const success = current
      ? await this.categoryService.update(current.id, value.request, value.imageFile)
      : await this.categoryService.add(value.request, value.imageFile);

    if (success) {
      this.showDrawer.set(false);
      this.editing.set(null);
    }
  }

  protected async confirmDelete(): Promise<void> {
    const category = this.toDelete();

    if (!category) return;

    const success = await this.categoryService.delete(category.id);

    if (success) {
      this.toDelete.set(null);
    }
  }

  protected categoryServiceRetry(): void {
    void this.categoryService.load();
  }
}
