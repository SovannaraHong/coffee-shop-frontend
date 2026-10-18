import { Injectable, signal } from '@angular/core';
import { CategoryRequest } from '../../../../../../libs/models/category/category-request.model';
import { CategoryResponse } from '../../../../../../libs/models/category/category-response.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _items = signal<CategoryResponse[]>([
    {
      id: 1,
      name: 'Hot Drinks',
      description: 'Coffee and tea served hot',
      image: null,
      isActive: true,
    },
    {
      id: 2,
      name: 'Cold Drinks',
      description: 'Iced and blended drinks',
      image: null,
      isActive: true,
    },
    {
      id: 3,
      name: 'Pastries',
      description: 'Fresh baked every morning',
      image: null,
      isActive: true,
    },
  ]);

  readonly items = this._items.asReadonly();

  getById(id: number): CategoryResponse | undefined {
    return this._items().find((c) => c.id === id);
  }

  add(data: CategoryRequest): void {
    const id = Math.max(0, ...this._items().map((c) => c.id)) + 1;
    this._items.update((list) => [
      ...list,
      {
        id,
        name: data.name,
        description: data.description ?? null,
        image: data.image ?? null,
        isActive: data.isActive ?? true,
      },
    ]);
  }

  update(id: number, data: CategoryRequest): void {
    this._items.update((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              name: data.name,
              description: data.description ?? null,
              image: data.image ?? null,
              isActive: data.isActive ?? c.isActive,
            }
          : c,
      ),
    );
  }

  remove(id: number): void {
    this._items.update((list) => list.filter((c) => c.id !== id));
  }
}
