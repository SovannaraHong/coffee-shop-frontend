import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { IngredientResponse } from '../../../../../../../libs/models/ingredient/ingredient-response';
import {
  STOCK_REASONS,
  StockReason,
} from '../../../../../../../libs/models/ingredient/ingredient-request';

export type StockMode = 'add' | 'remove' | 'set';

export interface StockChange {
  mode: StockMode;
  /** Amount to add/remove, or the new exact stock when mode is 'set'. */
  quantity: number;
  /** Used for add/remove only. */
  referenceType: StockReason;
  notes: string;
}

/** Reasons that make sense for each mode (the backend checks the same rules) */
const REASONS_FOR: Record<'add' | 'remove', StockReason[]> = {
  add: ['PURCHASE_ORDER', 'MANUAL'],
  remove: ['WASTE', 'MANUAL'],
};

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

  protected readonly modes: {
    value: StockMode;
    label: string;
    icon: string;
    hint: string;
  }[] = [
    {
      value: 'add',
      label: 'Add',
      icon: 'fa-solid fa-plus',
      hint: 'You know how much came in. Example: a delivery of 5,000 g.',
    },
    {
      value: 'remove',
      label: 'Remove',
      icon: 'fa-solid fa-minus',
      hint: 'Stock left outside of a sale. Example: 500 g expired.',
    },
    {
      value: 'set',
      label: 'Set exact',
      icon: 'fa-solid fa-pen',
      hint: 'You counted the shelf and the system number is wrong. Enter the real total.',
    },
  ];

  protected readonly mode = signal<StockMode>('add');
  protected readonly amount = signal('');
  protected readonly reason = signal<StockReason>('PURCHASE_ORDER');
  protected readonly notes = signal('');
  protected readonly triedSubmit = signal(false);

  protected readonly current = computed(() => this.ingredient()?.quantityInStock ?? 0);

  protected readonly unit = computed(() => {
    const r = this.ingredient() as unknown as Record<string, unknown> | null;
    return String(r?.['unit'] ?? r?.['unitName'] ?? '');
  });

  protected readonly hint = computed(() => this.modes.find((m) => m.value === this.mode())?.hint);

  /** Reasons shown for the current mode (none for "set") */
  protected readonly reasons = computed(() => {
    const m = this.mode();
    if (m === 'set') return [];
    return STOCK_REASONS.filter((r) => REASONS_FOR[m].includes(r.value));
  });

  protected readonly problem = computed<string | null>(() => {
    if (this.amount() === '') return 'Enter a quantity.';
    const value = Number(this.amount());
    if (Number.isNaN(value)) return 'Enter a valid number.';

    if (this.mode() === 'set') {
      if (value < 0) return 'Stock cannot be negative.';
      if (!this.notes().trim()) return 'Notes are required for a stock correction.';
    } else {
      if (value < 0.01) return 'Quantity must be greater than 0.';
      if (this.mode() === 'remove' && value > this.current()) {
        return 'You cannot remove more than the current stock.';
      }
    }
    if (this.notes().length > 255) return 'Notes must be at most 255 characters.';
    return null;
  });

  /** What the stock will be after saving */
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
      if (!this.open()) return;
      this.ingredient();
      untracked(() => {
        this.mode.set('add');
        this.amount.set('');
        this.reason.set('PURCHASE_ORDER');
        this.notes.set('');
        this.triedSubmit.set(false);
      });
    });
  }

  protected setMode(m: StockMode): void {
    this.mode.set(m);
    this.triedSubmit.set(false);
    if (m !== 'set') this.reason.set(REASONS_FOR[m][0]);
  }

  protected close(): void {
    if (!this.saving()) this.closed.emit();
  }

  protected save(): void {
    this.triedSubmit.set(true);
    if (this.problem() || this.saving()) return;

    this.submitted.emit({
      mode: this.mode(),
      quantity: Number(this.amount()),
      referenceType: this.mode() === 'set' ? 'MANUAL' : this.reason(),
      notes: this.notes().trim(),
    });
  }
}
