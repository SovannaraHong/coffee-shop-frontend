import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { IngredientResponse } from '../../../../../../../libs/models/ingredient/ingredient-response';
import { IngredientPayload } from '../../../../../../../libs/models/ingredient/ingredient-request';

@Component({
  selector: 'app-ingredient-drawer',
  templateUrl: './ingredient-drawer.html',
})
export class IngredientDrawer {
  readonly open = input(false);
  readonly ingredient = input<IngredientResponse | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<IngredientPayload>();

  protected readonly unitSuggestions = ['g', 'kg', 'ml', 'l', 'pcs', 'shot'];

  protected readonly name = signal('');
  protected readonly unit = signal('');
  protected readonly stock = signal('');
  protected readonly reorder = signal('');
  protected readonly submitted = signal(false);

  protected readonly isEdit = computed(() => !!this.ingredient());

  protected readonly formError = computed<string | null>(() => {
    const name = this.name().trim();
    const unit = this.unit().trim();
    if (!name) return 'Name is required.';
    if (name.length > 150) return 'Name must be at most 150 characters.';
    if (!unit) return 'Unit is required.';
    if (unit.length > 20) return 'Unit must be at most 20 characters.';
    if (!this.isEdit() && this.stock() !== '' && Number(this.stock()) < 0) {
      return 'Quantity in stock cannot be negative.';
    }
    if (this.reorder() !== '' && Number(this.reorder()) < 0) {
      return 'Reorder level cannot be negative.';
    }
    return null;
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }
      const ingredient = this.ingredient();
      untracked(() => this.reset(ingredient));
    });
  }

  private reset(i: IngredientResponse | null): void {
    this.submitted.set(false);
    this.name.set(i?.name ?? '');
    this.unit.set(i?.unit ?? '');
    this.stock.set(i ? String(i.quantityInStock) : '');
    this.reorder.set(i ? String(i.reorderLevel ?? '') : '');
  }

  protected close(): void {
    if (!this.saving()) {
      this.closed.emit();
    }
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.formError() || this.saving()) {
      return;
    }
    this.saved.emit({
      name: this.name().trim(),
      unit: this.unit().trim(),
      quantityInStock: !this.isEdit() && this.stock() !== '' ? Number(this.stock()) : undefined,
      reorderLevel: this.reorder() !== '' ? Number(this.reorder()) : undefined,
    });
  }
}
