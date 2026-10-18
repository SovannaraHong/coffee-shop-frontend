import { signal } from '@angular/core';

/**
 * Tiny in-memory CRUD store used while there is no API.
 * When the backend is ready, replace each service's body with HttpClient calls
 * (keep the same method names so the pages don't change much).
 */
export abstract class InMemoryStore<T extends { id: number }> {
  private readonly _items = signal<T[]>([]);
  readonly items = this._items.asReadonly();

  protected constructor(seed: T[]) {
    this._items.set(structuredClone(seed));
  }

  getById(id: number): T | undefined {
    return this._items().find((i) => i.id === id);
  }

  add(data: Omit<T, 'id'>): T {
    const id = Math.max(0, ...this._items().map((i) => i.id)) + 1;
    const item = { ...data, id } as T;
    this._items.update((list) => [item, ...list]);
    return item;
  }

  update(id: number, patch: Partial<T>): void {
    this._items.update((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  remove(id: number): void {
    this._items.update((list) => list.filter((i) => i.id !== id));
  }
}
