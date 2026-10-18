import { AddonIngredientService } from '../../../../../../../libs/api/addon-ingredient/addon-ingredient-service';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AddonService } from '../../../core/services/addon-service';
import { IngredientService } from '../../../core/services/ingredient-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { AddonIngredientDrawer } from '../addon-ingredient-drawer/addon-ingredient-drawer';
import {
  AddonIngredient,
  AddonIngredientInput,
} from '../../../../../../../libs/models/addon-ingredient/addon-ingredient';
import { Ingredient } from '../../../../../../../libs/models/ingredient/ingredient';

function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check your connection and try again.';
    const body = err.error;
    const fromApi =
      typeof body === 'string' ? body : (body?.message ?? body?.detail ?? body?.title);
    if (fromApi) return fromApi;
    if (err.status === 400) return 'Invalid data. Please check the form and try again.';
    if (err.status === 401 || err.status === 403) return 'You do not have permission to do this.';
    if (err.status === 404) return 'Add-on or ingredient not found.';
    if (err.status === 409) return 'This ingredient is already assigned to the add-on.';
    if (err.status >= 500) return 'Server error. Please try again later.';
  }
  return 'Something went wrong. Please try again.';
}

@Component({
  selector: 'app-addon-ingredient-list',
  imports: [DatePipe, DecimalPipe, RouterLink, PageHeader, ConfirmDialog, AddonIngredientDrawer],
  templateUrl: './addon-ingredient-list.html',
})
export class AddonIngredientList {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AddonIngredientService);
  private readonly addonService = inject(AddonService);
  private readonly ingredientService = inject(IngredientService);

  protected readonly addonId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly items = signal<AddonIngredient[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null); // page-level load error
  protected readonly actionError = signal<string | null>(null); // delete error banner

  protected readonly search = signal('');
  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly editing = signal<AddonIngredient | null>(null);
  protected readonly toDelete = signal<AddonIngredient | null>(null);
  protected readonly deleting = signal(false);

  protected readonly addonName = computed(
    () =>
      this.addonService.items().find((a) => a.id === this.addonId)?.name ??
      `Add-on #${this.addonId}`,
  );

  private readonly ingredientsById = computed(
    () => new Map<number, Ingredient>(this.ingredientService.items().map((i) => [i.id, i])),
  );

  /** Ingredients that can still be assigned (the one being edited is always kept) */
  protected readonly availableIngredients = computed(() => {
    const assigned = new Set(this.items().map((r) => r.ingredientId));
    const editingIngredientId = this.editing()?.ingredientId;
    return this.ingredientService
      .items()
      .filter((i) => i.isActive && (!assigned.has(i.id) || i.id === editingIngredientId));
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.items().filter((r) => !q || this.name(r).toLowerCase().includes(q));
  });

  constructor() {
    this.load();
  }

  protected name(r: AddonIngredient): string {
    return (
      r.ingredientName ??
      this.ingredientsById().get(r.ingredientId)?.name ??
      `Ingredient #${r.ingredientId}`
    );
  }

  protected unit(r: AddonIngredient): string {
    return r.unit ?? this.ingredientsById().get(r.ingredientId)?.unit ?? '';
  }

  protected load(silent = false): void {
    if (!silent) this.loading.set(true);
    this.error.set(null);
    this.service.list(this.addonId).subscribe({
      next: (rows) => {
        this.items.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.showForm.set(true);
  }

  protected openEdit(r: AddonIngredient): void {
    this.editing.set(r);
    this.formError.set(null);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    if (this.saving()) return;
    this.showForm.set(false);
  }

  protected save(v: AddonIngredientInput): void {
    const current = this.editing();
    this.saving.set(true);
    this.formError.set(null);

    const request = current
      ? this.service.update(this.addonId, current.id, v)
      : this.service.add(this.addonId, v);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load(true); // reload so server-generated fields (id, audit) are correct
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(errorMessage(err));
      },
    });
  }

  protected confirmDelete(): void {
    const r = this.toDelete();
    if (!r) return;
    this.deleting.set(true);
    this.actionError.set(null);
    this.service.remove(this.addonId, r.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.toDelete.set(null);
        this.load(true);
      },
      error: (err) => {
        this.deleting.set(false);
        this.toDelete.set(null);
        this.actionError.set(errorMessage(err));
      },
    });
  }
}
