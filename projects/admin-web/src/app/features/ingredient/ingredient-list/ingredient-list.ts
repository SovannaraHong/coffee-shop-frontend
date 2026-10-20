import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { IngredientService } from '../../../core/services/ingredient-service';
import { IngredientDrawer } from '../ingredient-drawer/ingredient-drawer';
import {
  IngredientStockDialog,
  StockChange,
} from '../ingredient-stock-dialog/ingredient-stock-dialog';
import { IngredientResponse } from '../../../../../../../libs/models/ingredient/ingredient-response';
import { IngredientPayload } from '../../../../../../../libs/models/ingredient/ingredient-request';

type StockFilter = 'all' | 'low' | 'active' | 'disabled';

@Component({
  selector: 'app-ingredient-list',
  imports: [ConfirmDialog, DecimalPipe, IngredientDrawer, IngredientStockDialog],
  templateUrl: './ingredient-list.html',
})
export class IngredientList implements OnInit {
  private readonly ingredientService = inject(IngredientService);

  protected readonly ingredients = this.ingredientService.items;
  protected readonly loading = this.ingredientService.loading;
  protected readonly error = this.ingredientService.error;
  protected readonly saving = this.ingredientService.saving;

  // Filters
  protected readonly tabs: { value: StockFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'low', label: 'Low stock' },
    { value: 'active', label: 'Active' },
    { value: 'disabled', label: 'Disabled' },
  ];
  protected readonly filter = signal<StockFilter>('all');
  protected readonly search = signal('');

  // Pagination
  protected readonly pageSize = 10;
  protected readonly page = signal(1);

  // Drawer, stock dialog, delete
  protected readonly showDrawer = signal(false);
  protected readonly editing = signal<IngredientResponse | null>(null);
  protected readonly saveError = signal<string | null>(null);

  protected readonly stockTarget = signal<IngredientResponse | null>(null);
  protected readonly stockError = signal<string | null>(null);

  protected readonly toDelete = signal<IngredientResponse | null>(null);
  protected readonly actionError = signal<string | null>(null);

  ngOnInit(): void {
    void this.ingredientService.load();
  }

  protected readonly lowCount = computed(
    () => this.ingredients().filter((i) => i.isLowStock && i.isActive).length,
  );

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const tab = this.filter();

    return this.ingredients().filter((i) => {
      const matchesSearch = !query || i.name.toLowerCase().includes(query);
      const matchesTab =
        tab === 'all' ||
        (tab === 'low' && i.isLowStock) ||
        (tab === 'active' && i.isActive) ||
        (tab === 'disabled' && !i.isActive);
      return matchesSearch && matchesTab;
    });
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

  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected setFilter(value: StockFilter): void {
    this.filter.set(value);
    this.page.set(1);
  }

  protected goTo(page: number): void {
    if (page < 1 || page > this.pageCount()) {
      return;
    }
    this.page.set(page);
  }

  // Drawer
  protected openAdd(): void {
    this.saveError.set(null);
    this.editing.set(null);
    this.showDrawer.set(true);
  }

  protected openEdit(ingredient: IngredientResponse): void {
    this.saveError.set(null);
    this.editing.set(ingredient);
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

  protected async onSaved(value: IngredientPayload): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.saveError.set(null);

    const current = this.editing();
    const success = current
      ? await this.ingredientService.update(current.id, {
          name: value.name,
          unit: value.unit,
          reorderLevel: value.reorderLevel,
        })
      : await this.ingredientService.add({
          name: value.name,
          unit: value.unit,
          quantityInStock: value.quantityInStock,
          reorderLevel: value.reorderLevel,
        });

    if (success) {
      this.showDrawer.set(false);
      this.editing.set(null);
    } else {
      this.saveError.set('Could not save the ingredient. Please try again.');
    }
  }

  // Stock dialog
  protected openStock(ingredient: IngredientResponse): void {
    this.stockError.set(null);
    this.stockTarget.set(ingredient);
  }

  protected closeStock(): void {
    if (this.saving()) {
      return;
    }
    this.stockTarget.set(null);
    this.stockError.set(null);
  }

  protected async onStockSubmitted(change: StockChange): Promise<void> {
    const target = this.stockTarget();
    if (!target || this.saving()) {
      return;
    }
    this.stockError.set(null);

    const notes = change.notes || undefined;
    const adjust = {
      quantity: change.quantity,
      referenceType: change.referenceType,
      notes,
    };

    const success =
      change.mode === 'add'
        ? await this.ingredientService.increaseStock(target.id, adjust)
        : change.mode === 'remove'
          ? await this.ingredientService.decreaseStock(target.id, adjust)
          : await this.ingredientService.setStock(target.id, {
              newQuantity: change.quantity,
              notes: change.notes,
            });

    if (success) {
      this.stockTarget.set(null);
    } else {
      this.stockError.set('Could not update the stock. Please try again.');
    }
  }

  // Enable / disable
  protected async setActive(ingredient: IngredientResponse, active: boolean): Promise<void> {
    if (ingredient.isActive === active || this.saving()) {
      return;
    }
    this.actionError.set(null);
    const success = await this.ingredientService.setActive(ingredient.id, active);
    if (!success) {
      this.actionError.set(`Could not ${active ? 'enable' : 'disable'} ${ingredient.name}.`);
      await this.ingredientService.load();
    }
  }

  // Delete
  protected async confirmDelete(): Promise<void> {
    const ingredient = this.toDelete();
    if (!ingredient || this.saving()) {
      return;
    }
    this.actionError.set(null);

    const success = await this.ingredientService.remove(ingredient.id);
    this.toDelete.set(null);

    if (success) {
      if (this.page() > this.pageCount()) {
        this.page.set(this.pageCount());
      }
    } else {
      this.actionError.set(
        `Could not delete ${ingredient.name}. It may be used in a recipe. Disable it instead.`,
      );
    }
  }
}
