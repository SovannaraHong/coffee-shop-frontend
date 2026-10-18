import { Injectable, signal } from '@angular/core';
import { Ingredient, IngredientInput } from '../../../../../../libs/models/ingredient/ingredient';

// Sample data. Swap this service for HttpClient calls when your API is ready.
const SEED: Ingredient[] = [
  {
    id: 1,
    name: 'Espresso beans',
    unit: 'kg',
    quantityInStock: 18,
    reorderLevel: 10,
    isActive: true,
    createdAt: '2026-09-01T08:00:00',
    updatedAt: null,
    createdBy: 'Alex Morgan',
    updatedBy: null,
  },
  {
    id: 2,
    name: 'Whole milk',
    unit: 'L',
    quantityInStock: 24,
    reorderLevel: 30,
    isActive: true,
    createdAt: '2026-09-01T08:05:00',
    updatedAt: '2026-10-16T08:12:00',
    createdBy: 'Alex Morgan',
    updatedBy: 'Alex Morgan',
  },
  {
    id: 3,
    name: 'Caramel syrup',
    unit: 'ml',
    quantityInStock: 800,
    reorderLevel: 1000,
    isActive: true,
    createdAt: '2026-09-02T09:10:00',
    updatedAt: null,
    createdBy: 'Alex Morgan',
    updatedBy: null,
  },
  {
    id: 4,
    name: 'Paper cups 12oz',
    unit: 'pcs',
    quantityInStock: 640,
    reorderLevel: 300,
    isActive: true,
    createdAt: '2026-09-03T10:00:00',
    updatedAt: null,
    createdBy: 'Sok Dara',
    updatedBy: null,
  },
  {
    id: 5,
    name: 'Oat milk',
    unit: 'L',
    quantityInStock: 12,
    reorderLevel: 8,
    isActive: false,
    createdAt: '2026-09-05T11:30:00',
    updatedAt: '2026-10-07T08:45:00',
    createdBy: 'Alex Morgan',
    updatedBy: 'Sok Dara',
  },
];

const CURRENT_USER = 'Admin'; // TODO: replace with your logged-in user

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly data = signal<Ingredient[]>(SEED);
  readonly items = this.data.asReadonly();

  add(v: IngredientInput): void {
    this.data.update((list) => {
      const id = Math.max(0, ...list.map((x) => x.id)) + 1;
      const created: Ingredient = {
        ...v,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        createdBy: CURRENT_USER,
        updatedBy: null,
      };
      return [created, ...list];
    });
  }

  update(id: number, v: IngredientInput): void {
    this.data.update((list) =>
      list.map((x) =>
        x.id === id
          ? { ...x, ...v, updatedAt: new Date().toISOString(), updatedBy: CURRENT_USER }
          : x,
      ),
    );
  }

  remove(id: number): void {
    this.data.update((list) => list.filter((x) => x.id !== id));
  }
}
