import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ProductOption,
  VariantResponse,
} from '../../../../../../../libs/models/variant/variant-response.model';

export interface VariantPayload {
  productId: number;
  name: string;
  price: number;
  sku: string;
  isActive: boolean;
}

@Component({
  selector: 'app-variant-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './variant-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class VariantDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly variant = input<VariantResponse | null>(null); // null = create
  readonly products = input<ProductOption[]>([]);
  readonly variants = input<VariantResponse[]>([]); // all variants, to show siblings
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<VariantPayload>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    productId: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    sku: [''],
    isActive: [true],
  });

  // live values from the form
  private readonly pickedId = toSignal(this.form.controls.productId.valueChanges, {
    initialValue: 0,
  });
  private readonly nameValue = toSignal(this.form.controls.name.valueChanges, { initialValue: '' });
  private readonly skuValue = toSignal(this.form.controls.sku.valueChanges, { initialValue: '' });

  /** Name of the product being worked on */
  protected readonly productName = computed(() => {
    const v = this.variant();
    if (v) return v.productName;
    const id = Number(this.pickedId());
    return this.products().find((p) => p.id === id)?.name ?? null;
  });

  /** Existing variants of that product */
  protected readonly siblings = computed(() => {
    const name = this.productName();
    if (!name) return [];
    return this.variants()
      .filter((x) => x.productName === name)
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly nameTaken = computed(() => {
    const n = this.nameValue().trim().toLowerCase();
    if (!n) return false;
    const editingId = this.variant()?.id;
    return this.siblings().some((s) => s.id !== editingId && s.name.toLowerCase() === n);
  });

  /** SKU is unique across ALL products */
  protected readonly skuOwner = computed(() => {
    const s = this.skuValue().trim().toLowerCase();
    if (!s) return null;
    const editingId = this.variant()?.id;
    return (
      this.variants().find((x) => x.id !== editingId && (x.sku ?? '').toLowerCase() === s) ?? null
    );
  });

  constructor() {
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const v = this.variant();
        untracked(() => {
          this.load(v);
          this.mounted.set(true);
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        });
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  private load(v: VariantResponse | null): void {
    this.form.reset({
      productId: 0,
      name: v?.name ?? '',
      price: v?.price ?? 0,
      sku: v?.sku ?? '',
      isActive: v?.isActive ?? true,
    });

    // The product can only be chosen when creating (the update request has no productId)
    if (v) this.form.controls.productId.disable();
    else this.form.controls.productId.enable();

    this.form.markAsUntouched();
  }

  protected setActive(v: boolean): void {
    this.form.controls.isActive.setValue(v);
  }

  protected invalid(c: { touched: boolean; invalid: boolean }): boolean {
    return c.touched && c.invalid;
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.nameTaken() || this.skuOwner()) return; // the messages are already visible

    const v = this.form.getRawValue();
    this.saved.emit({
      productId: Number(v.productId),
      name: v.name.trim(),
      price: Number(v.price),
      sku: v.sku.trim().toUpperCase(),
      isActive: v.isActive,
    });
  }
}
