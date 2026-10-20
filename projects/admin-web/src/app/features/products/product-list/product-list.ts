import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../core/services/category-service';
import { ProductService } from '../../../core/services/product-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ProductResponse } from '../../../../../../../libs/models/product/product-response.model';
import {
  ProductPayload,
  ProductRequest,
} from '../../../../../../../libs/models/product/product-request.model';
import { CurrencyPipe } from '@angular/common';
import { ProductDrawer } from '../product-drawer/product-drawer';

type Availability = 'all' | 'available' | 'unavailable';

@Component({
  selector: 'app-product-list',
  imports: [ConfirmDialog, CurrencyPipe, ProductDrawer],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = this.categoryService.items;
  protected readonly products = this.productService.items;
  protected readonly loading = this.productService.loading;
  protected readonly error = this.productService.error;
  protected readonly saving = this.productService.saving;

  protected readonly selectedProduct = signal<ProductResponse | null>(null);

  // Error message shown inside the drawer (string | null)
  protected readonly saveError = signal<string | null>(null);

  // Pagination
  protected readonly pageSize = 10;
  protected readonly page = signal(1);

  protected readonly availabilityTabs: { value: Availability; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Hidden' },
  ];

  // Filters
  protected readonly search = signal('');
  protected readonly categoryId = signal(0);
  protected readonly availability = signal<Availability>('all');

  // Drawer and deletion
  protected readonly toDelete = signal<ProductResponse | null>(null);
  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<ProductResponse | null>(null);

  ngOnInit(): void {
    void this.productService.load();
    void this.categoryService.load();
  }

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selectedCategory = this.categoryId();
    const selectedAvailability = this.availability();

    return this.products().filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.variants ?? []).some((variant) =>
          (variant.sku ?? '').toLowerCase().includes(query),
        );
      const matchesCategory = selectedCategory === 0 || product.categoryId === selectedCategory;

      const matchesAvailability =
        selectedAvailability === 'all' ||
        (selectedAvailability === 'available') === product.isActive;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  });

  // Pagination data
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index + 1),
  );

  // Filter actions
  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected setCategory(value: string | number): void {
    this.categoryId.set(Number(value));
    this.page.set(1);
  }

  protected setAvailability(value: Availability): void {
    this.availability.set(value);
    this.page.set(1);
  }

  protected viewProduct(product: ProductResponse): void {
    this.selectedProduct.set(product);
  }

  protected closeProductView(): void {
    this.selectedProduct.set(null);
  }

  protected goTo(page: number): void {
    if (page < 1 || page > this.pageCount()) {
      return;
    }
    this.page.set(page);
  }

  // Product display helpers

  /**
   * Variants sorted cheapest first (id as tiebreaker) so the order is always
   * stable, no matter what order the API returns them in.
   */
  protected sortedVariants(product: ProductResponse) {
    return [...(product.variants ?? [])].sort(
      (a, b) => (a.price ?? 0) - (b.price ?? 0) || a.id - b.id,
    );
  }

  protected categoryName(product: ProductResponse): string {
    return product.categoryName || '-';
  }

  protected firstVariantSku(product: ProductResponse): string {
    return this.sortedVariants(product)[0]?.sku ?? '-';
  }

  protected firstVariantPrice(product: ProductResponse): number {
    return this.sortedVariants(product)[0]?.price ?? 0;
  }

  protected variantCount(product: ProductResponse): number {
    return product.variants?.length ?? 0;
  }

  // Product drawer
  protected openAdd(): void {
    this.saveError.set(null);
    this.editing.set(null);
    this.showDrawer.set(true);
  }

  protected openEdit(product: ProductResponse): void {
    this.saveError.set(null);
    this.editing.set(product);
    this.showDrawer.set(true);
  }

  protected closeDrawer(): void {
    if (this.saving()) {
      return;
    }

    this.showDrawer.set(false);
    this.editing.set(null);
    this.saveError.set(null);
  }

  protected async onSaved(value: ProductPayload): Promise<void> {
    if (this.saving()) {
      return;
    }

    this.saveError.set(null);

    const current = this.editing();
    const imageFile = value.imageFile ?? null;

    const request: ProductRequest = {
      name: value.name,
      description: value.description,
      imageUrl: value.imageUrl ?? undefined,
      categoryId: value.categoryId,
      isActive: value.isActive,
      featured: value.featured,
      addonIds: value.addonIds,
      variants: value.variants,
    };

    const success = current
      ? await this.productService.update(current.id, request, imageFile)
      : await this.productService.add(request, imageFile);

    if (success) {
      this.showDrawer.set(false);
      this.editing.set(null);
      this.page.set(1);
    } else {
      this.saveError.set('Could not save the product. Please try again.');
    }
  }

  // Toggle product status
  protected async setAvailable(product: ProductResponse, available: boolean): Promise<void> {
    if (product.isActive === available || this.saving()) {
      return;
    }
    const success = await this.productService.changeStatus(product.id);
    if (!success) {
      await this.productService.load();
    }
  }

  // Toggle product feature
  protected async setFeature(product: ProductResponse, feature: boolean): Promise<void> {
    if (product.featured === feature || this.saving()) {
      return;
    }

    const updated = await this.productService.changeFeature(product.id);

    // Do NOT mutate `product` directly (signals can't see that).
    // On failure, reload so the toggle snaps back to the server value.
    if (!updated) {
      await this.productService.load();
    }
  }

  // Delete product
  protected async confirmDelete(): Promise<void> {
    const product = this.toDelete();
    if (!product || this.saving()) {
      return;
    }

    const success = await this.productService.remove(product.id);

    if (success) {
      this.toDelete.set(null);

      if (this.page() > this.pageCount()) {
        this.page.set(this.pageCount());
      }
    }
  }
}
