import { CurrencyPipe, DOCUMENT } from '@angular/common';
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

import { PurchaseOrderRequest } from '../../../../../../../libs/models/purchase-order/purchase-order-request.model';
import {
  IngredientOption,
  PurchaseOrderResponse,
  SupplierOption,
} from '../../../../../../../libs/models/purchase-order/purchase-order-response.model';

interface LineValue {
  ingredientId: number;
  quantity: number;
  unitCost: number;
}

@Component({
  selector: 'app-purchase-order-drawer',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './purchase-order-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class PurchaseOrderDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly order = input<PurchaseOrderResponse | null>(null); // null = create, value = edit
  readonly suppliers = input<SupplierOption[]>([]);
  readonly ingredients = input<IngredientOption[]>([]);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<PurchaseOrderRequest>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    supplierId: [0, [Validators.required, Validators.min(1)]],
    lines: this.fb.array([this.newLine()]),
  });

  constructor() {
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const o = this.order();
        untracked(() => {
          this.load(o);
          this.mounted.set(true);
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        });
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  private newLine(v?: LineValue) {
    return this.fb.group({
      ingredientId: [v?.ingredientId ?? 0, [Validators.required, Validators.min(1)]],
      quantity: [v?.quantity ?? 0, [Validators.required, Validators.min(0.001)]],
      unitCost: [v?.unitCost ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  /**
   * Fills the form for edit, or clears it for create.
   * The line controls are replaced here, so the template MUST use `track line`
   * (not `track $index`), otherwise the inputs stay bound to the old controls.
   */
  private load(o: PurchaseOrderResponse | null): void {
    const lines = this.form.controls.lines;
    lines.clear();

    let supplierId = 0;

    if (o) {
      const raw = o as unknown as Record<string, unknown>;
      supplierId =
        Number(raw['supplierId']) ||
        this.suppliers().find((s) => s.name === o.supplierName)?.id ||
        0;

      for (const d of o.details ?? []) {
        const rd = d as unknown as Record<string, unknown>;
        const ingredientId =
          Number(rd['ingredientId']) ||
          this.ingredients().find((i) => i.name === d.ingredientName)?.id ||
          0;
        lines.push(
          this.newLine({
            ingredientId,
            quantity: Number(rd['quantity']) || 0,
            unitCost: Number(rd['unitCost']) || 0,
          }),
        );
      }
    }

    if (!lines.length) lines.push(this.newLine());

    this.form.patchValue({ supplierId });
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  protected addLine(): void {
    this.form.controls.lines.push(this.newLine());
  }

  protected removeLine(i: number): void {
    if (this.form.controls.lines.length > 1) this.form.controls.lines.removeAt(i);
  }

  protected unitOf(i: number): string {
    const id = Number(this.form.controls.lines.at(i).controls.ingredientId.value);
    return this.ingredients().find((x) => x.id === id)?.unit ?? '';
  }

  protected lineTotal(i: number): number {
    const v = this.form.controls.lines.at(i).getRawValue();
    return (Number(v.quantity) || 0) * (Number(v.unitCost) || 0);
  }

  protected total(): number {
    return this.form.controls.lines.controls.reduce((sum, _, i) => sum + this.lineTotal(i), 0);
  }

  protected invalid(group: { touched: boolean; invalid: boolean }): boolean {
    return group.touched && group.invalid;
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saved.emit({
      supplierId: Number(v.supplierId),
      details: v.lines.map((l) => ({
        ingredientId: Number(l.ingredientId),
        quantity: Number(l.quantity),
        unitCost: Number(l.unitCost),
      })),
    });
  }
}
