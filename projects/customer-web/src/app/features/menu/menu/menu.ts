import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subscription, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  CategoryFilter,
  ALL_CATEGORY,
} from '../../../shared/components/category-filter/category-filter';
import { PromoCarousel } from '../../../shared/components/promo-carousel/promo-carousel';
import { MenuPaginator } from '../../../shared/components/menu-paginator/menu-paginator';
import { ProductResponse } from '../../../../../../../libs/models/product/product-response.model';
import { CategoryResponse } from '../../../../../../../libs/models/category/category-response.model';
import { ProductService } from '../../../../../../../libs/api/product/product.service';
import { CategoryService } from '../../../../../../../libs/api/category/category.service';

/** How many products to request per backend call */
const FETCH_SIZE = 50;
/** How many products to show per display page */
const DISPLAY_SIZE = 12;
const FIRST_PAGE = 1;
/** How long (ms) the transition spinner shows when switching tabs / pages */
const TRANSITION_MS = 300;

@Component({
  standalone: true,
  imports: [CategoryFilter, PromoCarousel, MenuPaginator],
  selector: 'app-menu',
  templateUrl: './menu.html',
})
export class Menu {
  private readonly productApi = inject(ProductService);
  private readonly categoryApi = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);
  private fetchSub?: Subscription;

  readonly activeCategory = signal<string>(ALL_CATEGORY);
  readonly favoriteIds    = signal<number[]>([]);
  readonly currentPage    = signal(FIRST_PAGE);

  /** Every active product fetched from the backend (all pages combined) */
  readonly allProducts    = signal<ProductResponse[]>([]);
  readonly isLoading      = signal(false);
  readonly loadError      = signal(false);
  /** True for TRANSITION_MS when switching tabs or pages — shows spinner briefly */
  readonly isTransitioning = signal(false);

  /* ── Categories for filter tabs ──────────────────────────────────────── */
  private readonly categoryList = toSignal(
    this.categoryApi.getActiveCategories().pipe(
      catchError(() => of<CategoryResponse[]>([])),
    ),
    { initialValue: [] as CategoryResponse[] },
  );

  readonly categories = computed(() => this.categoryList().map((c) => c.name));

  /* ── Derived / display signals ───────────────────────────────────────── */

  /** Products matching the active category tab */
  readonly filtered = computed(() => {
    const all      = this.allProducts();
    const category = this.activeCategory();
    if (category === ALL_CATEGORY) return all;
    return all.filter((p) => p.categoryName === category);
  });

  /** Total display pages for the current filter */
  readonly totalPage = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / DISPLAY_SIZE)),
  );

  /** The slice of products shown on the current display page */
  readonly items = computed(() => {
    const start = (this.currentPage() - 1) * DISPLAY_SIZE;
    return this.filtered().slice(start, start + DISPLAY_SIZE);
  });

  /** Group current page's products by category for the carousels */
  readonly productsByCategory = computed(() =>
    this.items().reduce<Record<string, ProductResponse[]>>((acc, p) => {
      (acc[p.categoryName] ??= []).push(p);
      return acc;
    }, {}),
  );

  readonly visibleCategories = computed(() => Object.keys(this.productsByCategory()));

  readonly isAllTab = computed(() => this.activeCategory() === ALL_CATEGORY);

  /* ── Init ────────────────────────────────────────────────────────────── */
  constructor() {
    this.destroyRef.onDestroy(() => this.fetchSub?.unsubscribe());
    this.loadAllProducts();
  }

  /* ── Backend fetch — walk all pages, combine into allProducts ────────── */
  loadAllProducts(): void {
    this.fetchSub?.unsubscribe();
    this.isLoading.set(true);
    this.loadError.set(false);

    // Send both param styles so it works regardless of backend endpoint variant
    const query = (p: number) =>
      this.productApi.getProducts({
        page: p, _page: p,
        size: FETCH_SIZE, _limit: FETCH_SIZE,
        isActive: true,
      });

    this.fetchSub = query(FIRST_PAGE).pipe(
      switchMap((first) => {
        const total = first.paginationDTO?.totalPage ?? 1;
        if (total <= 1) return of(first.list);

        // Fetch remaining pages in parallel
        const rest = Array.from({ length: total - 1 }, (_, i) =>
          query(FIRST_PAGE + 1 + i).pipe(map((r) => r.list)),
        );
        return forkJoin(rest).pipe(map((pages) => [...first.list, ...pages.flat()]));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  /* ── Public handlers ─────────────────────────────────────────────────── */

  /** Show spinner briefly then apply the change — gives visual feedback without scrolling */
  private transition(apply: () => void): void {
    this.isTransitioning.set(true);
    setTimeout(() => {
      apply();
      this.isTransitioning.set(false);
    }, TRANSITION_MS);
  }

  onCategorySelect(category: string): void {
    if (category === this.activeCategory()) return;
    this.transition(() => {
      this.activeCategory.set(category);
      this.currentPage.set(FIRST_PAGE);
    });
  }

  goToPage(page: number): void {
    if (page === this.currentPage()) return;
    this.transition(() => {
      this.currentPage.set(page);
    });
  }

  onToggleFavorite(productId: number): void {
    this.favoriteIds.update((ids) =>
      ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId],
    );
  }

  onAddToCart(productId: number): void {
    console.log('add to cart', productId);
  }
}
