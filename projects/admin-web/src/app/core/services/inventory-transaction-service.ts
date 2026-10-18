import { InventoryTransaction } from './../../../../../../libs/models/inventoryTransaction/inventory-transaction';
import { Injectable, signal } from '@angular/core';

// Sample data. Swap this service for HttpClient calls when your API is ready.
const SEED: InventoryTransaction[] = [
  {
    id: 1,
    ingredientId: 1,
    transactionType: 'Purchase',
    quantity: 10,
    transactionDate: '2026-10-02T09:30:00',
    referenceId: 1001,
    referenceType: 'PURCHASE_ORDER',
    notes: null,
    createdAt: '2026-10-02T09:30:00',
    updatedAt: null,
    createdBy: 'Alex Morgan',
    updatedBy: null,
  },
  {
    id: 2,
    ingredientId: 2,
    transactionType: 'Usage',
    quantity: -6,
    transactionDate: '2026-10-15T11:02:00',
    referenceId: 1048,
    referenceType: 'ORDERS',
    notes: null,
    createdAt: '2026-10-15T11:02:00',
    updatedAt: null,
    createdBy: 'System',
    updatedBy: null,
  },
  {
    id: 3,
    ingredientId: 2,
    transactionType: 'Adjustment',
    quantity: -4,
    transactionDate: '2026-10-16T08:12:00',
    referenceId: 12,
    referenceType: 'STOCK_ADJUSTMENTS',
    notes: 'Spoilage',
    createdAt: '2026-10-16T08:12:00',
    updatedAt: null,
    createdBy: 'Alex Morgan',
    updatedBy: null,
  },
  {
    id: 4,
    ingredientId: 3,
    transactionType: 'Usage',
    quantity: -120,
    transactionDate: '2026-10-17T14:20:00',
    referenceId: 1052,
    referenceType: 'ORDERS',
    notes: null,
    createdAt: '2026-10-17T14:20:00',
    updatedAt: null,
    createdBy: 'System',
    updatedBy: null,
  },
  {
    id: 5,
    ingredientId: 4,
    transactionType: 'Waste',
    quantity: -30,
    transactionDate: '2026-10-11T10:05:00',
    referenceId: null,
    referenceType: null,
    notes: 'Damaged box',
    createdAt: '2026-10-11T10:05:00',
    updatedAt: null,
    createdBy: 'Sok Dara',
    updatedBy: null,
  },
  {
    id: 6,
    ingredientId: 5,
    transactionType: 'Purchase',
    quantity: 12,
    transactionDate: '2026-10-07T08:45:00',
    referenceId: 1002,
    referenceType: 'PURCHASE_ORDER',
    notes: null,
    createdAt: '2026-10-07T08:45:00',
    updatedAt: null,
    createdBy: 'Alex Morgan',
    updatedBy: null,
  },
];

// Temporary lookup. Replace with your INGREDIENT table / IngredientService.
export const INGREDIENT_LOOKUP: Record<number, { name: string; unit: string }> = {
  1: { name: 'Espresso beans', unit: 'kg' },
  2: { name: 'Whole milk', unit: 'L' },
  3: { name: 'Caramel syrup', unit: 'ml' },
  4: { name: 'Paper cups 12oz', unit: 'pcs' },
  5: { name: 'Oat milk', unit: 'L' },
};

@Injectable({ providedIn: 'root' })
export class InventoryTransactionService {
  private readonly data = signal<InventoryTransaction[]>(SEED);
  readonly items = this.data.asReadonly();

  ingredient(id: number) {
    return INGREDIENT_LOOKUP[id] ?? { name: `Ingredient #${id}`, unit: '' };
  }
}
