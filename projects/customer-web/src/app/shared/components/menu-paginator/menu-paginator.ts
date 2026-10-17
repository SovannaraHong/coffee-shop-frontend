import { Component, computed, input, output } from '@angular/core';

type PageItem = number | '...';

@Component({
  selector: 'app-menu-paginator',
  standalone: true,
  templateUrl: './menu-paginator.html',
})
export class MenuPaginator {
  readonly currentPage = input.required<number>();
  readonly totalPage = input.required<number>();
  readonly pageChange = output<number>();

  /**
   * Builds the page items list with ellipsis:
   *   1 … 3 4 5 … 10
   * Always shows first, last, current ±1 sibling pages.
   */
  readonly pages = computed<PageItem[]>(() => {
    const current = this.currentPage();
    const total = this.totalPage();

    if (total <= 7) {
      // Show all pages — no ellipsis needed
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const items: PageItem[] = [];
    const showLeftDots = current > 4;
    const showRightDots = current < total - 3;

    items.push(1);

    if (showLeftDots) {
      items.push('...');
    }

    // Pages around current
    const rangeStart = showLeftDots ? Math.max(2, current - 1) : 2;
    const rangeEnd = showRightDots ? Math.min(total - 1, current + 1) : total - 1;

    for (let p = rangeStart; p <= rangeEnd; p++) {
      items.push(p);
    }

    if (showRightDots) {
      items.push('...');
    }

    items.push(total);

    return items;
  });

  readonly hasPrev = computed(() => this.currentPage() > 1);
  readonly hasNext = computed(() => this.currentPage() < this.totalPage());

  go(page: number | '...'): void {
    if (page === '...' || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  prev(): void {
    if (this.hasPrev()) this.pageChange.emit(this.currentPage() - 1);
  }

  next(): void {
    if (this.hasNext()) this.pageChange.emit(this.currentPage() + 1);
  }
}
