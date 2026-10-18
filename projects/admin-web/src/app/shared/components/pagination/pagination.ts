import { Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="flex flex-col items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm sm:flex-row">
      <p class="text-neutral-500">
        @if (total() === 0) { No results } @else { Showing {{ from() }}–{{ to() }} of {{ total() }} }
      </p>
      <div class="flex items-center gap-1">
        <button type="button" class="btn btn-outline btn-sm" [disabled]="page() <= 1" (click)="go(page() - 1)">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        @for (p of pages(); track p) {
          <button type="button" class="btn btn-sm min-w-8" [class]="p === page() ? 'btn-primary' : 'btn-outline'" (click)="go(p)">
            {{ p }}
          </button>
        }
        <button type="button" class="btn btn-outline btn-sm" [disabled]="page() >= pageCount()" (click)="go(page() + 1)">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `,
})
export class Pagination {
  readonly total = input.required<number>();
  readonly pageSize = input(8);
  readonly page = model(1);

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));
  protected readonly from = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  protected go(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pageCount()));
  }
}
