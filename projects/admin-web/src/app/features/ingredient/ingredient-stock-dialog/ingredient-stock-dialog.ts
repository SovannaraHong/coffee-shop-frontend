import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { IngredientResponse } from '../../../../../../../libs/models/ingredient/ingredient-response';
import { STOCK_REASONS } from '../../../../../../../libs/models/ingredient/ingredient-request';

export type StockMode = 'add' | 'remove' | 'set';

export interface StockChange {
  mode: StockMode;
  /** Amount to add/remove, or the new exact stock when mode is 'set'. */
  quantity: number;
  /** Only used for add/remove (the backend requires it there). */
  referenceType: string;
  notes: string;
}

@Component({
  selector: 'app-ingredient-stock-dialog',
  imports: [DecimalPipe],
  templateUrl: './ingredient-stock-dialog.html',
})
export class IngredientStockDialog {
  readonly open = input(false);
  readonly ingredient = input<IngredientResponse | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly submitted = output<StockChange>();

  protected readonly modes: { value: StockMode; label: string }[] = [
    { value: 'add', label: 'Add' },
    { value: 'remove', label: 'Remove' },
    { value: 'set', label: 'Set exact' },
  ];
  protected readonly reasons = STOCK_REASONS;

  protected readonly mode = signal<StockMode>('add');
  protected readonly amount = signal('');
  protected readonly reason = signal(STOCK_REASONS[0].value);
  protected readonly notes = signal('');
  protected readonly triedSubmit = signal(false);

  protected readonly current = computed(() => this.ingredient()?.quantityInStock ?? 0);

  protected readonly problem = computed<string | null>(() => {
    if (this.amount() === '') return 'Enter a quantity.';
    const value = Number(this.amount());
    if (Number.isNaN(value)) return 'Enter a valid number.';

    if (this.mode() === 'set') {
      if (value < 0) return 'Stock cannot be negative.';
      if (!this.notes().trim()) return 'Notes are required for a manual stock correction.';
    } else {
      if (value < 0.01) return 'Quantity must be greater than 0.';
      if (this.mode() === 'remove' && value > this.current()) {
        return 'You cannot remove more than the current stock.';
      }
    }
    if (this.notes().length > 255) return 'Notes must be at most 255 characters.';
    return null;
  });

  /** What the stock will be after saving (null until a valid number is typed). */
  protected readonly preview = computed<number | null>(() => {
    if (this.amount() === '' || Number.isNaN(Number(this.amount()))) return null;
    const value = Number(this.amount());
    switch (this.mode()) {
      case 'add':
        return this.current() + value;
      case 'remove':
        return this.current() - value;
      default:
        return value;
    }
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }
      this.ingredient();
      untracked(() => {
        this.mode.set('add');
        this.amount.set('');
        this.reason.set(STOCK_REASONS[0].value);
        this.notes.set('');
        this.triedSubmit.set(false);
      });
    });
  }

  protected close(): void {
    if (!this.saving()) {
      this.closed.emit();
    }
  }

  protected save(): void {
    this.triedSubmit.set(true);
    if (this.problem() || this.saving()) {
      return;
    }
    this.submitted.emit({
      mode: this.mode(),
      quantity: Number(this.amount()),
      referenceType: this.reason(),
      notes: this.notes().trim(),
    });
  }
}
