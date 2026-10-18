import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { IngredientService } from '../../../core/services/ingredient-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { IngredientDrawer } from '../ingredient-drawer/ingredient-drawer';
import {
  Ingredient,
  IngredientInput,
} from '../../../../../../../libs/models/ingredient/ingredient';

@Component({
  selector: 'app-ingredient-list',
  imports: [DatePipe, DecimalPipe, PageHeader, ConfirmDialog, IngredientDrawer],
  templateUrl: './ingredient-list.html',
})
export class IngredientList {
  private readonly service = inject(IngredientService);

  protected readonly search = signal('');
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Ingredient | null>(null);
  protected readonly toDelete = signal<Ingredient | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.service.items().filter(
      (r) =>
        !q ||
        [r.name, r.unit, r.createdBy].some((v) =>
          String(v ?? '')
            .toLowerCase()
            .includes(q),
        ),
    );
  });

  protected openAdd(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(r: Ingredient): void {
    this.editing.set(r);
    this.showForm.set(true);
  }

  protected save(v: IngredientInput): void {
    const current = this.editing();
    if (current) this.service.update(current.id, v);
    else this.service.add(v);
    this.showForm.set(false);
  }

  protected confirmDelete(): void {
    const r = this.toDelete();
    if (r) this.service.remove(r.id);
    this.toDelete.set(null);
  }
}
