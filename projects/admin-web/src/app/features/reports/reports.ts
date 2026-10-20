import { ProductApiService } from './../../../../../../libs/api/product/product.service';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TOP_SELLING } from '../../core/data/mock-data';
import { InventoryService } from '../../core/services/inventory-service';

import { PageHeader } from '../../shared/components/page-header/page-header';
import { AreaChart } from '../../shared/components/charts/area-chart/area-chart';

@Component({
  selector: 'app-reports',
  imports: [PageHeader, AreaChart],
  templateUrl: './reports.html',
})
export class Reports {
  private readonly products = inject(ProductApiService);
  private readonly inventory = inject(InventoryService);

  protected readonly months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  protected readonly thisYear = signal([
    42000, 53000, 48000, 61000, 72000, 69000, 74000, 82000, 78000, 86000, 91000, 97000,
  ]);
  protected readonly lastYear = signal([
    38000, 45000, 47000, 56000, 65000, 63000, 68000, 70000, 69000, 75000, 80000, 84000,
  ]);
  protected readonly onlyThisYear = signal(false);

  protected readonly series = computed(() => {
    const all = [
      { name: 'This Year', color: '#e8643c', data: this.thisYear() },
      { name: 'Last Year', color: '#1e8a5a', data: this.lastYear() },
    ];
    return this.onlyThisYear() ? all.slice(0, 1) : all;
  });

  protected readonly lowStockCount = computed(() => this.inventory.lowStock().length);
  protected readonly outOfStockCount = computed(() => this.inventory.outOfStock().length);

  // protected readonly topProducts = computed(() =>
  //   TOP_SELLING.map((t) => {
  //     const p = this.products.getById(t.productId);
  //     return { name: p?.name ?? 'Unknown', units: t.units, revenue: t.units * (p?.price ?? 0) };
  //   }),
  // );

  protected randomize(): void {
    const rnd = () => Math.round((35000 + Math.random() * 65000) / 1000) * 1000;
    const cur = Array.from({ length: 12 }, rnd);
    this.thisYear.set(cur);
    this.lastYear.set(
      cur.map((v) => Math.max(30000, Math.round((v * (0.8 + Math.random() * 0.15)) / 1000) * 1000)),
    );
  }

  protected toggleYears(): void {
    this.onlyThisYear.update((v) => !v);
  }
}
