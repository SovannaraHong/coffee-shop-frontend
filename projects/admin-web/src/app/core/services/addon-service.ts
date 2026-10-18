import { Addon, AddonInput } from './../../../../../../libs/models/addon/addon';
import { Injectable, signal } from '@angular/core';

// Sample data. Swap this service for HttpClient calls when your API is ready.
const SEED: Addon[] = [
  {
    id: 1,
    name: 'Extra shot',
    price: 0.75,
    isActive: true,
    createdAt: '2026-09-01T08:00:00',
    updatedAt: null,
    createdBy: 'Alex Morgan',
    updatedBy: null,
  },
  {
    id: 2,
    name: 'Oat milk',
    price: 0.6,
    isActive: true,
    createdAt: '2026-09-01T08:05:00',
    updatedAt: null,
    createdBy: 'Alex Morgan',
    updatedBy: null,
  },
  {
    id: 3,
    name: 'Vanilla syrup',
    price: 0.5,
    isActive: true,
    createdAt: '2026-09-02T09:10:00',
    updatedAt: '2026-10-05T10:00:00',
    createdBy: 'Alex Morgan',
    updatedBy: 'Sok Dara',
  },
  {
    id: 4,
    name: 'Whipped cream',
    price: 0.4,
    isActive: false,
    createdAt: '2026-09-03T10:00:00',
    updatedAt: '2026-10-10T09:30:00',
    createdBy: 'Sok Dara',
    updatedBy: 'Alex Morgan',
  },
];

const CURRENT_USER = 'Admin'; // TODO: replace with your logged-in user

@Injectable({ providedIn: 'root' })
export class AddonService {
  private readonly data = signal<Addon[]>(SEED);
  readonly items = this.data.asReadonly();

  add(v: AddonInput): void {
    this.data.update((list) => {
      const id = Math.max(0, ...list.map((x) => x.id)) + 1;
      const created: Addon = {
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

  update(id: number, v: AddonInput): void {
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
