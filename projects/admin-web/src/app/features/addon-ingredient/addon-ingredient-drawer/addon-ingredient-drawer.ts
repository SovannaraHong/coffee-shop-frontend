import {
  AddonIngredient,
  AddonIngredientInput,
} from '../../../../../../../libs/models/addon-ingredient/addon-ingredient';
import { DOCUMENT } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ingredient } from '../../../../../../../libs/models/ingredient/ingredient';

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
  readonly item = input<AddonIngredient | null>(null); // full row (when editing)
  readonly ingredients = input<Ingredient[]>([]); // ingredients the user can pick
  readonly saving = input(false);
  readonly error = input<string | null>(null); // server error to show in the form

  readonly closed = output<void>();
  readonly saved = output<AddonIngredientInput>();

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    ingredientId: this.fb.control<number | null>(null, Validators.required),
    quantityRequired: [0, [Validators.required, Validators.min(0.0001)]],
  });

  private readonly selectedId = toSignal(this.form.controls.ingredientId.valueChanges, {
    initialValue: this.form.controls.ingredientId.value,
  });

  /** Unit of the picked ingredient, shown next to the quantity */
  protected readonly selectedUnit = computed(
    () => this.ingredients().find((i) => i.id === this.selectedId())?.unit ?? '',
  );

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

    // Lock the form while a request is running
    effect(() => {
      const busy = this.saving();
      untracked(() => {
        if (busy) this.form.disable({ emitEvent: false });
        else {
          this.form.enable({ emitEvent: false });
          if (this.item()) this.form.controls.ingredientId.disable({ emitEvent: false });
        }
      });
    });
  }

  private load(s: AddonIngredient | null): void {
    this.form.enable({ emitEvent: false });
    this.form.reset({
      ingredientId: s ? s.ingredientId : null,
      quantityRequired: s ? s.quantityRequired : 0,
    });
    // The ingredient can't be changed on an existing row. Remove it and assign another one instead.
    if (s) this.form.controls.ingredientId.disable({ emitEvent: false });
    this.form.markAsUntouched();
  }

  protected submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { ingredientId, quantityRequired } = this.form.getRawValue();
    this.saved.emit({
      ingredientId: Number(ingredientId),
      quantityRequired: Number(quantityRequired),
    });
  }
}
