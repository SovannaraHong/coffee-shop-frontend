import { CategoryApiService } from './../../../../../../libs/api/category/category.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import { CategoryRequest } from '../../../../../../libs/models/category/category-request.model';
import { CategoryResponse } from '../../../../../../libs/models/category/category-response.model';
import { firstValueFrom, single } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly categoryApi = inject(CategoryApiService);

  //private writable state
  private readonly _items = signal<CategoryResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public read-only state

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  readonly total = computed(() => this._items().length);

  // GET: Load Categories from backend service

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(this.categoryApi.getAllCategories());
      this._items.set(result);
    } catch (error: unknown) {
      console.error('Failed to load categories:', error);
      this._error.set('Unable to load categories. Please try again.');
    } finally {
      this._loading.set(false);
    }
  }

  // POST: Create category

  async add(request: CategoryRequest, imageFile: File | null = null): Promise<boolean> {
    this._saving.set(true);
    this._error.set(null);

    try {
      // Step 1: Create category and get its generated ID
      const created = await firstValueFrom(this.categoryApi.createCategory(request));

      // Step 2: Upload image if the user selected one
      if (imageFile) {
        try {
          await firstValueFrom(this.categoryApi.uploadCategoryImage(created.id, imageFile));
        } catch (error: unknown) {
          console.error('Category created, but image upload failed:', error);

          this._error.set(
            'Category created, but image upload failed. Please check the image upload API.',
          );
          // Step 3: Refresh the category list

          await this.load();
          return true;
        }
      }
      await this.load();
      return true;
    } catch (error: unknown) {
      console.error('Failed to create category:', error);
      this._error.set('Unable to create category. Please try again.');
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // PUT: Update category

  async update(
    id: number,
    request: CategoryRequest,
    imageFile: File | null = null,
  ): Promise<boolean> {
    this._saving.set(true);
    this._error.set(null);
    try {
      // Step 1: Update category details
      await firstValueFrom(this.categoryApi.updateCategory(id, request));

      // Step 2: Upload the new image if selected
      if (imageFile) {
        await firstValueFrom(this.categoryApi.uploadCategoryImage(id, imageFile));
      }
      await this.load();
      return true;
    } catch (error: unknown) {
      console.error('Failed to update category or upload image:', error);
      this._error.set('Unable to update category or upload its image. Please try again.');

      await this.load();
      return false;
    } finally {
      this._saving.set(false);
    }
  }
  // DELETE: Delete category
  async delete(id: number): Promise<boolean> {
    this._saving.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(this.categoryApi.deleteCategory(id));
      this._items.update((items) => items.filter((category) => category.id !== id));
      return true;
    } catch (error: unknown) {
      console.error('Failed to delete category:', error);
      this._error.set('Unable to delete category. It may contain existing products.');
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }
}
