import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ProductService } from '../../../core/services/product-service';
import { RecipeService } from '../../../core/services/recipe-service';
// ASSUMPTION: an IngredientService exists with `items` (signal) and `load()`.
// Each item needs: id, name, unit. Adjust the path/field names to match yours.
import { IngredientService } from '../../../core/services/ingredient-service';
import { RecipeResponse } from '../../../../../../../libs/models/recipe/recipe-response.model';
import { RecipePayload } from '../../../../../../../libs/models/recipe/recipe-request.model';
import { RecipeDrawer } from '../recipe-drawer/recipe-drawer';

@Component({
  selector: 'app-recipe-list',
  imports: [ConfirmDialog, DecimalPipe, RecipeDrawer],
  templateUrl: './recipe-list.html',
})
export class RecipeList implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly productService = inject(ProductService);
  private readonly ingredientService = inject(IngredientService);

  protected readonly recipes = this.recipeService.items;
  protected readonly products = this.productService.items;
  protected readonly ingredients = this.ingredientService.items;
  protected readonly loading = this.recipeService.loading;
  protected readonly error = this.recipeService.error;
  protected readonly saving = this.recipeService.saving;

  // UI state
  protected readonly search = signal('');
  protected readonly selected = signal<RecipeResponse | null>(null);
  protected readonly toDelete = signal<RecipeResponse | null>(null);
  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<RecipeResponse | null>(null);
  protected readonly saveError = signal<string | null>(null);

  // Pagination
  protected readonly pageSize = 10;
  protected readonly page = signal(1);

  ngOnInit(): void {
    void this.recipeService.load();
    void this.productService.load();
    void this.ingredientService.load();
  }

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) {
      return this.recipes();
    }
    return this.recipes().filter(
      (r) =>
        r.productName.toLowerCase().includes(query) ||
        r.productVariantName.toLowerCase().includes(query) ||
        r.ingredients.some((i) => i.ingredientName.toLowerCase().includes(query)),
    );
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index + 1),
  );

  /** Variants that already have a recipe (backend allows one recipe per variant). */
  protected readonly takenVariantIds = computed(() =>
    this.recipes().map((r) => r.productVariantId),
  );

  /** How many variants still need a recipe, shown in the page subtitle. */
  protected readonly missingCount = computed(() => {
    const taken = new Set(this.takenVariantIds());
    return this.products()
      .flatMap((p) => p.variants ?? [])
      .filter((v) => !taken.has(v.id)).length;
  });

  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected goTo(page: number): void {
    if (page < 1 || page > this.pageCount()) {
      return;
    }
    this.page.set(page);
  }

  // View modal
  protected view(recipe: RecipeResponse): void {
    this.selected.set(recipe);
  }

  protected closeView(): void {
    this.selected.set(null);
  }

  // Drawer
  protected openAdd(): void {
    this.saveError.set(null);
    this.editing.set(null);
    this.showDrawer.set(true);
  }

  protected openEdit(recipe: RecipeResponse): void {
    this.saveError.set(null);
    this.editing.set(recipe);
    this.showDrawer.set(true);
  }

  protected closeDrawer(): void {
    if (this.saving()) {
      return;
    }
    this.showDrawer.set(false);
    this.editing.set(null);
    this.saveError.set(null);
  }

  protected async onSaved(value: RecipePayload): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.saveError.set(null);

    const current = this.editing();
    const success = current
      ? await this.recipeService.update(current.id, {
          instructions: value.instructions,
          ingredients: value.ingredients,
        })
      : await this.recipeService.add(value);

    if (success) {
      this.showDrawer.set(false);
      this.editing.set(null);
    } else {
      this.saveError.set('Could not save the recipe. Please try again.');
    }
  }

  // Delete
  protected async confirmDelete(): Promise<void> {
    const recipe = this.toDelete();
    if (!recipe || this.saving()) {
      return;
    }

    const success = await this.recipeService.remove(recipe.id);
    if (success) {
      this.toDelete.set(null);
      if (this.page() > this.pageCount()) {
        this.page.set(this.pageCount());
      }
    }
  }
}
