import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ProductApiService } from '../../../../../../../../libs/api/product/product-api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductApiService);

  readonly product = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => this.productService.getProductById(id)),
    ),
    { initialValue: null },
  );

  readonly variants = computed(() => this.product()?.variants ?? []);
  readonly activeVariants = computed(() => this.variants().filter((v) => v.isActive));

  readonly addons = computed(() => this.product()?.addons ?? []);
  readonly activeAddons = computed(() => this.addons().filter((a) => a.isActive));

  readonly selectedVariantId = signal<number | null>(null);
  readonly selectedAddonIds = signal<Set<number>>(new Set());
  readonly quantity = signal(1);

  private readonly autoSelectVariant = computed(() => {
    const variants = this.activeVariants();
    if (this.selectedVariantId() === null && variants.length > 0) {
      const cheapest = variants.reduce((min, v) => (v.price < min.price ? v : min), variants[0]);
      this.selectedVariantId.set(cheapest.id);
    }
    return null;
  });

  constructor() {
    this.autoSelectVariant();
  }

  selectVariant(variantId: number): void {
    this.selectedVariantId.set(variantId);
  }

  readonly selectedVariant = computed(() => {
    const variantId = this.selectedVariantId();
    if (variantId === null) return null;
    return this.activeVariants().find((v) => v.id === variantId) ?? null;
  });

  isAddonSelected(addonId: number): boolean {
    return this.selectedAddonIds().has(addonId);
  }

  toggleAddon(addonId: number): void {
    const next = new Set(this.selectedAddonIds());
    next.has(addonId) ? next.delete(addonId) : next.add(addonId);
    this.selectedAddonIds.set(next);
  }

  readonly selectedAddons = computed(() =>
    this.activeAddons().filter((a) => this.selectedAddonIds().has(a.id)),
  );

  readonly addonsTotal = computed(() => this.selectedAddons().reduce((sum, a) => sum + a.price, 0));

  clearAddons(): void {
    this.selectedAddonIds.set(new Set());
  }

  increaseQuantity(): void {
    this.quantity.update((value) => value + 1);
  }

  decreaseQuantity(): void {
    this.quantity.update((value) => Math.max(1, value - 1));
  }

  readonly unitPrice = computed(() => (this.selectedVariant()?.price ?? 0) + this.addonsTotal());
  readonly subtotal = computed(() => this.unitPrice() * this.quantity());

  addToCart(): void {
    const variant = this.selectedVariant();
    if (!variant) {
      alert('Please select a size.');
      return;
    }

    console.log('Add to cart:', {
      product: this.product(),
      variant,
      addons: this.selectedAddons(),
      quantity: this.quantity(),
      subtotal: this.subtotal(),
    });

    alert(`${variant.name} added to cart. Quantity: ${this.quantity()}`);
  }
}
