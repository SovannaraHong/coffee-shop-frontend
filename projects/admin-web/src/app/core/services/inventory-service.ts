import { Injectable, computed } from '@angular/core';
import { InventoryItem, stockStatus } from '../models/inventory-item';
import { INVENTORY } from '../data/mock-data';
import { InMemoryStore } from './in-memory-store';

@Injectable({ providedIn: 'root' })
export class InventoryService extends InMemoryStore<InventoryItem> {
  readonly lowStock = computed(() => this.items().filter((i) => stockStatus(i) === 'Low stock'));
  readonly outOfStock = computed(() => this.items().filter((i) => stockStatus(i) === 'Out of stock'));

  constructor() {
    super(INVENTORY);
  }

  restock(id: number, qty: number): void {
    const item = this.getById(id);
    if (!item) return;
    this.update(id, { quantity: item.quantity + qty, lastRestocked: new Date().toISOString().slice(0, 10) });
  }
}
