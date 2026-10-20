import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AddonApiService } from '../../../../../../../libs/api/addon/addon.service';
import { ProductPayload } from '../../../../../../../libs/models/product/product-request.model';
import { ProductResponse } from '../../../../../../../libs/models/product/product-response.model';
import { AddonResponse } from '../../../../../../../libs/models/addon/addon-response.model';
import { VariantRequest } from '../../../../../../../libs/models/variant/variant-request.model';

@Component({
  selector: 'app-product-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './product-drawer.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class ProductDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly addonApi = inject(AddonApiService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  // Inputs (parent controls saving + server error)
  readonly open = input(false);
  readonly product = input<ProductResponse | null>(null);
  readonly categories = input<{ id: number; name: string }[]>([]);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  // Outputs
  readonly closed = output<void>();
  readonly saved = output<ProductPayload>();

  // Slide-in animation state
  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  // Add-ons
  protected readonly addons = signal<AddonResponse[]>([]);
  protected readonly addonsLoading = signal(false);
  protected readonly addonsError = signal('');

  // Image
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  private imageObjectUrl: string | null = null;

  // Local validation message
  protected readonly formError = signal('');

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    categoryId: this.fb.control<number | null>(null, Validators.required),
    isActive: [true],
    featured: [false],
    addonIds: this.fb.array<number>([]),
    variants: this.fb.array([this.createVariant()]),
  });

  protected get variants(): FormArray {
    return this.form.controls.variants;
  }

  protected get addonIds(): FormArray {
    return this.form.controls.addonIds;
  }

  constructor() {
    // Render above everything, outside the page layout
    this.doc.body.appendChild(this.host.nativeElement);
    this.destroyRef.onDestroy(() => {
      this.revokePreview();
      this.host.nativeElement.remove();
    });

    this.loadAddons();

    // Keep the template in sync with form state (needed when zoneless) and
    // drop the stale banner as soon as the user edits something.
    this.form.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.formError() && this.form.valid) {
        this.formError.set('');
      }
      this.cdr.markForCheck();
    });

    effect(() => {
      const isOpen = this.open();
      const product = this.product();
      untracked(() => {
        if (isOpen) {
          this.populateForm(product);
          this.mounted.set(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => this.shown.set(true));
          });
        } else {
          this.shown.set(false);
        }
      });
    });
  }

  // ---------- Variants ----------

  private createVariant(variant?: VariantRequest) {
    return this.fb.group({
      name: [variant?.name ?? '', [Validators.required, Validators.maxLength(80)]],
      price: [Number(variant?.price ?? 0), [Validators.required, Validators.min(0.01)]],
      sku: [variant?.sku ?? '', [Validators.required, Validators.maxLength(80)]],
    });
  }

  protected addVariant(): void {
    this.variants.push(this.createVariant());
  }

  protected removeVariant(index: number): void {
    if (this.variants.length > 1) this.variants.removeAt(index);
  }

  // ---------- Add-ons ----------

  protected loadAddons(): void {
    this.addonsLoading.set(true);
    this.addonsError.set('');

    this.addonApi
      .getAllAddons()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.addons.set(result.filter((a) => a.isActive));
          this.addonsLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load add-ons:', err);
          this.addonsError.set('Unable to load add-ons.');
          this.addonsLoading.set(false);
        },
      });
  }

  protected hasAddon(id: number): boolean {
    return this.addonIds.controls.some((c) => Number(c.value) === id);
  }

  protected toggleAddon(id: number): void {
    const index = this.addonIds.controls.findIndex((c) => Number(c.value) === id);
    if (index >= 0) this.addonIds.removeAt(index);
    else this.addonIds.push(this.fb.control(id));
  }

  // ---------- Load form ----------

  private populateForm(product: ProductResponse | null): void {
    this.formError.set('');
    this.revokePreview();
    this.selectedImage.set(null);
    this.imagePreview.set(product?.imageUrl ?? null);

    this.addonIds.clear();
    this.variants.clear();

    this.form.patchValue({
      name: product?.name ?? '',
      description: product?.description ?? '',
      categoryId: product?.categoryId ?? null,
      isActive: product?.isActive ?? true,
      featured: product?.featured ?? false,
    });

    if (product?.variants?.length) {
      for (const v of product.variants) {
        this.variants.push(this.createVariant({ name: v.name, price: v.price, sku: v.sku }));
      }
    } else {
      this.variants.push(this.createVariant());
    }

    for (const addon of product?.addons ?? []) {
      this.addonIds.push(this.fb.control(addon.id));
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // ---------- Image ----------

  protected onImage(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.formError.set('Please select a PNG, JPG or WebP image.');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.formError.set('The image must be 2 MB or smaller.');
      input.value = '';
      return;
    }

    this.formError.set('');
    this.revokePreview();
    this.selectedImage.set(file);
    this.imageObjectUrl = URL.createObjectURL(file);
    this.imagePreview.set(this.imageObjectUrl);
  }

  /** Clear the picked/current image. */
  protected removeImage(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.revokePreview();
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  private revokePreview(): void {
    if (this.imageObjectUrl) {
      URL.revokeObjectURL(this.imageObjectUrl);
      this.imageObjectUrl = null;
    }
  }

  // ---------- Close / submit ----------

  protected requestClose(): void {
    if (!this.saving()) this.closed.emit();
  }

  protected onEscape(): void {
    if (this.open()) this.requestClose();
  }

  /** Debug helper: lists every invalid control with its errors and value. */
  private invalidPaths(control: AbstractControl, path = ''): string[] {
    if (control instanceof FormGroup || control instanceof FormArray) {
      return Object.entries(control.controls).flatMap(([key, child]) =>
        this.invalidPaths(child, path ? `${path}.${key}` : key),
      );
    }
    return control.invalid
      ? [`${path} -> ${JSON.stringify(control.errors)} (value: ${JSON.stringify(control.value)})`]
      : [];
  }

  protected submit(): void {
    if (this.saving()) return;

    if (this.form.invalid) {
      console.warn('Invalid controls:', this.invalidPaths(this.form)); // remove when fixed
      this.form.markAllAsTouched();
      this.formError.set(
        this.variants.invalid
          ? 'Check the variant name, price and SKU.'
          : 'Please complete all required fields correctly.',
      );
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.categoryId === null) {
      this.formError.set('Please select a category.');
      return;
    }

    const variants: VariantRequest[] = raw.variants.map((v) => ({
      name: v.name.trim(),
      price: Number(v.price),
      sku: v.sku.trim(),
    }));

    if (variants.some((v) => !v.name || !v.sku || !Number.isFinite(v.price) || v.price <= 0)) {
      this.formError.set('Every variant needs a name, SKU and a price greater than zero.');
      return;
    }

    const payload: ProductPayload = {
      name: raw.name.trim(),
      description: raw.description.trim(),
      // image removed and nothing new picked -> empty string so the backend can clear it
      imageUrl: this.imagePreview() === null ? '' : (this.product()?.imageUrl ?? ''),
      imageFile: this.selectedImage(),
      categoryId: raw.categoryId,
      isActive: raw.isActive,
      featured: raw.featured,
      addonIds: raw.addonIds.map(Number),
      variants,
    };

    this.formError.set('');
    this.saved.emit(payload);
  }
}
