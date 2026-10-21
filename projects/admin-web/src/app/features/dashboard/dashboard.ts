import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, RevenueRange } from '../../core/services/dashboard-service';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { BarChart } from '../../shared/components/charts/bar-chart/bar-chart';
import { StatCard } from '../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, PageHeader, StatusBadge, BarChart, StatCard],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly dash = inject(DashboardService);

  protected readonly today = new Date().toISOString();
  protected readonly loading = signal(false);

  // Time-range filter
  protected readonly rangeFilter = this.dash.rangeFilter;
  protected readonly rangeTabs: { value: RevenueRange; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  // Computed period label for stat card notes
  protected readonly periodLabel = computed(() => {
    const map: Record<RevenueRange, string> = {
      day: 'today',
      week: 'this week',
      month: 'this month',
      year: 'this year',
    };
    return map[this.rangeFilter()];
  });

  // KPI cards
  protected readonly totalRevenue = this.dash.totalRevenue;
  protected readonly orderCount = this.dash.orderCount;
  protected readonly totalPurchase = this.dash.totalPurchase;
  protected readonly lowStockCount = this.dash.lowStockCount;

  // Summary cards
  protected readonly allTimeRevenue = this.dash.allTimeRevenue;
  protected readonly avgOrderValue = this.dash.avgOrderValue;
  protected readonly allTimePurchase = this.dash.allTimePurchase;

  // Overall info counts
  protected readonly customerCount = this.dash.customerCount;
  protected readonly supplierCount = this.dash.supplierCount;
  protected readonly productCount = this.dash.productCount;

  // Lists
  protected readonly recentOrders = this.dash.recentOrders;
  protected readonly lowStockItems = this.dash.lowStockItems;
  protected readonly topSelling = this.dash.topSelling;

  // Chart
  protected readonly chartLabels = this.dash.chartLabels;
  protected readonly weekSeries = computed(() => [
    { name: 'Sales', color: '#e66239', data: this.dash.salesChartData() },
    { name: 'Purchases', color: '#f7a085', data: this.dash.purchaseChartData() },
  ]);

  // Badge colour pills for top-selling
  protected readonly pillTones = [
    'border-red-400 bg-red-50 text-red-500',
    'border-[#e8643c] bg-orange-50 text-[#e8643c]',
    'border-cyan-400 bg-cyan-50 text-cyan-600',
    'border-green-400 bg-green-50 text-green-600',
    'border-yellow-400 bg-yellow-50 text-yellow-600',
  ];

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    await this.dash.loadAll();
    this.loading.set(false);
  }
}
