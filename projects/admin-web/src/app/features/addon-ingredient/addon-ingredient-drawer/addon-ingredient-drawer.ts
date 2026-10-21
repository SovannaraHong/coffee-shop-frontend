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

import { AddonIngredientRequest } from '../../../../../../../libs/models/addon-ingredient/addon-ingredient-request.model';
import {
  AddonIngredientResponse,
  IngredientOption,
} from '../../../../../../../libs/models/addon-ingredient/addon-ingredient-response.model';

@Component({
  selector: 'app-addon-ingredient-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './addon-ingredient-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class AddonIngredientDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly item = input<AddonIngredientResponse | null>(null);
  readonly ingredients = input<IngredientOption[]>([]);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<AddonIngredientRequest>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    ingredientId: [0, [Validators.required, Validators.min(1)]],
    quantityRequired: [0, [Validators.required, Validators.min(0.001)]],
  });

  constructor() {
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

  private load(s: AddonIngredientResponse | null): void {
    this.form.reset(
      s
        ? { ingredientId: s.ingredientId, quantityRequired: s.quantityRequired }
        : { ingredientId: 0, quantityRequired: 0 },
    );
    this.form.markAsUntouched();
  }

  /** Unit of the ingredient currently selected (shown next to the quantity). */
  protected selectedUnit(): string {
    const id = Number(this.form.controls.ingredientId.value);
    return this.ingredients().find((i) => i.id === id)?.unit ?? '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saved.emit({
      ingredientId: Number(v.ingredientId),
      quantityRequired: Number(v.quantityRequired),
    });
  }
}
