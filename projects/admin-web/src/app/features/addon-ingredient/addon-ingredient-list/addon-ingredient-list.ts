import { DecimalPipe, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, Pipe, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AddonIngredientService } from '../../../core/services/addon-ingredient-service';
import { AddonService } from '../../../core/services/addon-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { AddonIngredientDrawer } from '../addon-ingredient-drawer/addon-ingredient-drawer';
import { AddonIngredientRequest } from '../../../../../../../libs/models/addon-ingredient/addon-ingredient-request.model';
import { AddonIngredientResponse } from '../../../../../../../libs/models/addon-ingredient/addon-ingredient-response.model';
import { AddonResponse } from '../../../../../../../libs/models/addon/addon-response.model';

@Component({
  selector: 'app-addon-ingredient-list',
  imports: [
    DecimalPipe,
    RouterLink,
    PageHeader,
    ConfirmDialog,
    AddonIngredientDrawer,
    CurrencyPipe,
  ],
  templateUrl: './addon-ingredient-list.html',
})
export class AddonIngredientList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly addonService = inject(AddonService);
  protected readonly service = inject(AddonIngredientService);

  protected readonly addonId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly addon = signal<AddonResponse | null>(null);

  protected readonly skeleton = [1, 2, 3, 4];
  protected readonly search = signal('');
  protected readonly showForm = signal(false);
  protected readonly editing = signal<AddonIngredientResponse | null>(null);
  protected readonly toDelete = signal<AddonIngredientResponse | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.service
      .items()
      .filter((r) => !q || r.ingredientName.toLowerCase().includes(q))
      .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
  });

  /** Ingredients that can still be picked (hide the ones already assigned). */
  protected readonly available = computed(() => {
    const editingIngredientId = this.editing()?.ingredientId;
    const used = new Set(this.service.items().map((i) => i.ingredientId));
    return this.service
      .ingredients()
      .filter((i) => !used.has(i.id) || i.id === editingIngredientId);
  });

  async ngOnInit(): Promise<void> {
    this.service.load(this.addonId);
    this.service.loadIngredients();
    this.addon.set(await this.addonService.getById(this.addonId));
  }

  protected clearSearch(): void {
    this.search.set('');
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(r: AddonIngredientResponse): void {
    this.editing.set(r);
    this.showForm.set(true);
  }

  protected async save(v: AddonIngredientRequest): Promise<void> {
    const current = this.editing();
    const ok = current
      ? await this.service.update(this.addonId, current.id, v)
      : await this.service.add(this.addonId, v);
    if (ok) this.showForm.set(false);
  }

  protected async confirmDelete(): Promise<void> {
    const r = this.toDelete();
    if (r) await this.service.remove(this.addonId, r.id);
    this.toDelete.set(null);
  }
}
