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
import {
  Ingredient,
  INGREDIENT_UNITS,
  IngredientInput,
} from '../../../../../../../libs/models/ingredient/ingredient';

export type IngredientPayload = IngredientInput;

@Component({
  selector: 'app-ingredient-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './ingredient-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class IngredientDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly item = input<Ingredient | null>(null);

  readonly closed = output<void>();
  readonly saved = output<IngredientPayload>();

  protected readonly unitOptions = INGREDIENT_UNITS;

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  private readonly defaults: IngredientInput = {
    name: '',
    unit: 'g',
    quantityInStock: 0,
    reorderLevel: 0,
    isActive: true,
  };

  protected readonly form = this.fb.group({
    name: [this.defaults.name, Validators.required],
    unit: [this.defaults.unit],
    quantityInStock: [this.defaults.quantityInStock, Validators.min(0)],
    reorderLevel: [this.defaults.reorderLevel, Validators.min(0)],
    isActive: [this.defaults.isActive],
  });

  constructor() {
    // Render on top of the whole app (above the top bar and sidebar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const s = this.item();
        untracked(() => {
          this.load(s);
          this.mounted.set(true);
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        });
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  private load(s: Ingredient | null): void {
    this.form.reset(
      s
        ? {
            name: s.name,
            unit: s.unit,
            quantityInStock: s.quantityInStock,
            reorderLevel: s.reorderLevel,
            isActive: s.isActive,
          }
        : this.defaults,
    );
    this.form.markAsUntouched();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
