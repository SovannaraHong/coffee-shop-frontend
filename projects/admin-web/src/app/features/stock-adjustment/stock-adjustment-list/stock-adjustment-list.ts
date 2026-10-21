import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { StockAdjustmentService } from '../../../core/services/stock-adjustment-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StockAdjustmentResponse } from '../../../../../../../libs/models/stock-adjustment/stock-adjustment-response.model';

@Component({
  selector: 'app-stock-adjustment-list',
  imports: [DatePipe, DecimalPipe, PageHeader],
  templateUrl: './stock-adjustment-list.html',
})
export class StockAdjustmentList implements OnInit {
  protected readonly service = inject(StockAdjustmentService);

  protected readonly skeleton = [1, 2, 3, 4, 5, 6];
  protected readonly search = signal('');
  protected readonly tabs: string[] = ['all', 'increase', 'decrease'];
  protected readonly tab = signal('all');

  protected readonly label: Record<string, string> = {
    all: 'All',
    increase: 'Increased',
    decrease: 'Decreased',
  };

  protected readonly stats = computed(() => {
    const items = this.service.items();
    const up = items.filter((r) => this.delta(r) > 0).length;
    const down = items.filter((r) => this.delta(r) < 0).length;
    return { total: items.length, up, down };
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.tab();
    return this.service
      .items()
      .filter(
        (r) =>
          (!q ||
            [r.ingredientName, r.notes].some((v) =>
              String(v ?? '')
                .toLowerCase()
                .includes(q),
            )) &&
          this.matchesTab(r, t),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  ngOnInit(): void {
    this.service.load();
  }

  /** How much the stock changed: new minus old. */
  protected delta(r: StockAdjustmentResponse): number {
    return (r.newQuantity ?? 0) - (r.oldQuantity ?? 0);
  }

  protected abs(n: number): number {
    return Math.abs(n);
  }

  private matchesTab(r: StockAdjustmentResponse, t: string): boolean {
    if (t === 'all') return true;
    return t === 'increase' ? this.delta(r) > 0 : this.delta(r) < 0;
  }

  protected tabCount(t: string): number {
    return this.service.items().filter((r) => this.matchesTab(r, t)).length;
  }

  protected clearSearch(): void {
    this.search.set('');
  }

  protected clearFilters(): void {
    this.search.set('');
    this.tab.set('all');
  }
}
