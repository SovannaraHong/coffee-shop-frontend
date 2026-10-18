import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../core/models/product';

export interface ProductPayload {
  name: string;
  description: string;
  imageUrl: string;
  categoryId: number;
  isActive: boolean;
  featured: boolean;
  addonIds: number[];
  variants: { name: string; price: number; sku: string }[];
}

@Component({
  selector: 'app-product-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './product-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class ProductDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly product = input<Product | null>(null);
  readonly categories = input<{ id: number; name: string }[]>([]);

  readonly closed = output<void>();
  readonly saved = output<ProductPayload>();

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  /** Replace with a real AddonService when you have one */
  protected readonly addons = [
    { id: 1, name: 'Cream', icon: 'fa-cloud' },
    { id: 2, name: 'Extra shot', icon: 'fa-bolt' },
    { id: 3, name: 'Caramel', icon: 'fa-candy-cane' },
    { id: 4, name: 'Oat milk', icon: 'fa-wheat-awn' },
  ];

  protected imagePreview: string | null = null;
  protected imageName = '';

  private variantGroup(v?: { name: string; price: number; sku: string }) {
    return this.fb.group({
      name: [v?.name ?? '', Validators.required],
      price: [v?.price ?? 0, [Validators.required, Validators.min(0)]],
      sku: [v?.sku ?? '', Validators.required],
    });
  }

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    isActive: [true],
    featured: [false],
    addonIds: [[] as number[]],
    variants: this.fb.array([this.variantGroup()]),
  });

  protected get variants() {
    return this.form.controls.variants;
  }

  constructor() {
    // Render on top of the whole app (above the top bar and sidebar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const p = this.product();
        untracked(() => {
          this.load(p);
          this.mounted.set(true);
          // wait two frames so the closed state is painted before sliding in
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        });
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  private load(p: Product | null): void {
    this.variants.clear();
    if (p) {
      const list = p.sizes.length ? p.sizes : ['Regular'];
      list.forEach((s) =>
        this.variants.push(this.variantGroup({ name: s, price: p.price, sku: `${p.sku}-${s[0]}` })),
      );
      this.form.patchValue({
        name: p.name,
        description: p.description ?? '',
        categoryId: p.categoryId,
        isActive: p.available,
        featured: false,
        addonIds: [],
      });
      this.imagePreview = p.imageUrl ?? null;
      this.imageName = p.imageUrl ?? '';
    } else {
      this.variants.push(this.variantGroup());
      this.form.reset({
        name: '',
        description: '',
        categoryId: 0,
        isActive: true,
        featured: false,
        addonIds: [],
      });
      this.imagePreview = null;
      this.imageName = '';
    }
    this.form.markAsUntouched();
  }

  protected addVariant(): void {
    this.variants.push(this.variantGroup());
  }
  protected removeVariant(i: number): void {
    if (this.variants.length > 1) this.variants.removeAt(i);
  }

  protected hasAddon(id: number): boolean {
    return this.form.controls.addonIds.value.includes(id);
  }
  protected toggleAddon(id: number): void {
    const c = this.form.controls.addonIds;
    c.setValue(c.value.includes(id) ? c.value.filter((x) => x !== id) : [...c.value, id]);
  }

  protected onImage(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    this.imagePreview = file ? URL.createObjectURL(file) : null;
    this.imageName = file?.name ?? '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saved.emit({ ...v, categoryId: +v.categoryId, imageUrl: this.imageName });
  }
}
