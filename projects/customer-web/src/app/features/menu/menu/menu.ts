import { ProductApiService } from './../../../../../../../libs/api/product/product-api.service';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs';
import {
  CategoryFilter,
  ALL_CATEGORY,
} from '../../../shared/components/category-filter/category-filter';
import { PromoCarousel } from '../../../shared/components/promo-carousel/promo-carousel';
import { ProductResponse } from '../../../../../../../libs/models/product/product-response.model';

type MenuStatus = 'loading' | 'success' | 'error';

interface MenuState {
  status: MenuStatus;
  products: ProductResponse[];
}

const LOADING_STATE: MenuState = { status: 'loading', products: [] };
const ERROR_STATE: MenuState = { status: 'error', products: [] };

@Component({
  standalone: true,
  imports: [CategoryFilter, PromoCarousel],
  selector: 'app-menu',
  templateUrl: './menu.html',
})
export class Menu {
  private readonly productApi = inject(ProductApiService);

  private readonly refresh$ = new Subject<void>();

  readonly activeCategory = signal<string>(ALL_CATEGORY);
  readonly favoriteIds = signal<number[]>([]);

  readonly menuState = toSignal(
    this.refresh$.pipe(
      startWith(void 0),
      switchMap(() =>
        this.productApi.getAllProducts().pipe(
          map((products): MenuState => ({ status: 'success', products })),
          catchError(() => of(ERROR_STATE)),
          startWith(LOADING_STATE),
        ),
      ),
    ),
    { initialValue: LOADING_STATE },
  );

  readonly products = computed(() => this.menuState().products);
  readonly isLoading = computed(() => this.menuState().status === 'loading');
  readonly loadError = computed(() => this.menuState().status === 'error');

  readonly categories = computed<string[]>(() => [
    ...new Set(
      this.products()
        .map((product) => product.categoryName)
        .filter((name): name is string => Boolean(name)),
    ),
  ]);

  readonly productsByCategory = computed(() =>
    this.products().reduce<Record<string, ProductResponse[]>>((acc, product) => {
      (acc[product.categoryName] ??= []).push(product);
      return acc;
    }, {}),
  );

  readonly visibleCategories = computed(() =>
    this.activeCategory() === ALL_CATEGORY ? this.categories() : [this.activeCategory()],
  );

  retry(): void {
    this.refresh$.next();
  }

  onCategorySelect(category: string): void {
    this.activeCategory.set(category);
  }

  onToggleFavorite(productId: number): void {
    this.favoriteIds.update((ids) =>
      ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId],
    );
  }

  onAddToCart(productId: number): void {
    // TODO: wire up to a real cart service
    console.log('add to cart', productId);
  }
}
