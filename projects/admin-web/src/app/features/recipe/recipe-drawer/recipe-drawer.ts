import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { ProductResponse } from '../../../../../../../libs/models/product/product-response.model';
import { RecipeResponse } from '../../../../../../../libs/models/recipe/recipe-response.model';
import { RecipePayload } from '../../../../../../../libs/models/recipe/recipe-request.model';

/** Minimal shape needed from your ingredient list. Adjust field names if yours differ. */
export interface IngredientOption {
  id: number;
  name: string;
  unit?: string | null;
}

interface Row {
  ingredientId: number;
  quantity: string;
}

@Component({
  selector: 'app-recipe-drawer',
  templateUrl: './recipe-drawer.html',
})
export class RecipeDrawer {
  readonly open = input(false);
  readonly recipe = input<RecipeResponse | null>(null);
  readonly products = input<ProductResponse[]>([]);
  readonly ingredients = input<IngredientOption[]>([]);
  /** Variant ids that already have a recipe (the backend allows only one per variant). */
  readonly takenVariantIds = input<number[]>([]);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<RecipePayload>();

  protected readonly productId = signal(0);
  protected readonly variantId = signal(0);
  protected readonly instructions = signal('');
  protected readonly rows = signal<Row[]>([]);
  protected readonly submitted = signal(false);

  protected readonly isEdit = computed(() => !!this.recipe());

  protected readonly variants = computed(() => {
    const product = this.products().find((p) => p.id === this.productId());
    return [...(product?.variants ?? [])].sort(
      (a, b) => (a.price ?? 0) - (b.price ?? 0) || a.id - b.id,
    );
  });

  protected readonly formError = computed<string | null>(() => {
    if (!this.isEdit() && !this.variantId()) {
      return 'Choose a product and a size.';
    }
    const rows = this.rows();
    if (rows.length === 0) {
      return 'Add at least one ingredient.';
    }
    const seen = new Set<number>();
    for (const row of rows) {
      if (!row.ingredientId) {
        return 'Choose an ingredient for every row.';
      }
      if (seen.has(row.ingredientId)) {
        return 'Each ingredient can only be added once.';
      }
      seen.add(row.ingredientId);
      if (!(Number(row.quantity) >= 0.01)) {
        return 'Quantity must be at least 0.01 for every ingredient.';
      }
    }
    return null;
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }
      const recipe = this.recipe();
      untracked(() => this.reset(recipe));
    });
  }

  private reset(recipe: RecipeResponse | null): void {
    this.submitted.set(false);
    if (recipe) {
      this.productId.set(recipe.productId);
      this.variantId.set(recipe.productVariantId);
      this.instructions.set(recipe.instructions ?? '');
      this.rows.set(
        recipe.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: String(i.quantityRequired),
        })),
      );
    } else {
      this.productId.set(0);
      this.variantId.set(0);
      this.instructions.set('');
      this.rows.set([{ ingredientId: 0, quantity: '' }]);
    }
  }

  protected onProductChange(value: string): void {
    this.productId.set(Number(value));
    this.variantId.set(0);
  }

  protected onVariantChange(value: string): void {
    this.variantId.set(Number(value));
  }

  protected addRow(): void {
    this.rows.update((rows) => [...rows, { ingredientId: 0, quantity: '' }]);
  }

  protected removeRow(index: number): void {
    this.rows.update((rows) => rows.filter((_, i) => i !== index));
  }

  protected setRowIngredient(index: number, value: string): void {
    this.rows.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ingredientId: Number(value) } : r)),
    );
  }

  protected setRowQuantity(index: number, value: string): void {
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, quantity: value } : r)));
  }

  protected unitOf(ingredientId: number): string {
    return this.ingredients().find((i) => i.id === ingredientId)?.unit ?? '';
  }

  /** Ingredient already picked in another row (so it can be disabled in the dropdown). */
  protected pickedElsewhere(ingredientId: number, rowIndex: number): boolean {
    return this.rows().some((r, i) => i !== rowIndex && r.ingredientId === ingredientId);
  }

  protected isTaken(variantId: number): boolean {
    return this.takenVariantIds().includes(variantId);
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
      productVariantId: this.variantId(),
      instructions: this.instructions().trim(),
      ingredients: this.rows().map((r) => ({
        ingredientId: r.ingredientId,
        quantityRequired: Number(r.quantity),
      })),
    });
  }
}
