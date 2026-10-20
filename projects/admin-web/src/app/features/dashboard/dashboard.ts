import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DEMO_TODAY,
  TOP_SELLING,
  WEEK_EXPENSES,
  WEEK_LABELS,
  WEEK_SALES,
} from '../../core/data/mock-data';
import { stockStatus } from '../../core/models/inventory-item';
import { InventoryService } from '../../core/services/inventory-service';
import { OrderService } from '../../core/services/order-service';
import { ProductService } from '../../core/services/product-service';
import { StaffService } from '../../core/services/staff-service';
import { SupplierService } from '../../core/services/supplier-service';
import { DonutChart, DonutSegment } from '../../shared/components/charts/donut-chart';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { BarChart } from '../../shared/components/charts/bar-chart/bar-chart';
import { CustomerRing } from '../../shared/components/customer-ring/customer-ring';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    PageHeader,
    StatusBadge,
    BarChart,
    StatCard,
    CustomerRing,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly orders = inject(OrderService);
  private readonly inventory = inject(InventoryService);
  private readonly products = inject(ProductService);
  protected readonly staff = inject(StaffService).items;
  protected readonly suppliers = inject(SupplierService).items;

  protected readonly today = DEMO_TODAY;
  protected readonly weekLabels = WEEK_LABELS;
  protected readonly weekSeries = [
    { name: 'Sales', color: '#e66239', data: WEEK_SALES },
    { name: 'Expenses', color: '#f7a085', data: WEEK_EXPENSES },
  ];
  protected readonly pillTones = [
    'border-red-400 bg-red-50 text-red-500',
    'border-[#e8643c] bg-orange-50 text-[#e8643c]',
    'border-cyan-400 bg-cyan-50 text-cyan-600',
    'border-green-400 bg-green-50 text-green-600',
    'border-yellow-400 bg-yellow-50 text-yellow-600',
  ];
  protected readonly customerSegments: DonutSegment[] = [
    { label: 'New customers', value: 312, color: '#e66239' },
    { label: 'Returning', value: 548, color: '#10b981' },
  ];

  private readonly todaysOrders = computed(() => {
    const today = new Date().toDateString();

    return this.orders.items().filter((o) => new Date(o.orderDate).toDateString() === today);
  });
  protected readonly todaysOrderCount = computed(() => this.todaysOrders().length);
  protected readonly todaysSales = computed(() =>
    this.todaysOrders()
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.finalAmount ?? 0), 0),
  );
  protected readonly avgOrderValue = computed(() => {
    const list = this.todaysOrders().filter((o) => o.status !== 'CANCELLED');

    return list.length ? this.todaysSales() / list.length : 0;
  });
  protected readonly customerCount = computed(
    () => new Set(this.orders.items().map((o) => o.customerName)).size,
  );
  protected readonly lowStockCount = computed(
    () => this.inventory.lowStock().length + this.inventory.outOfStock().length,
  );

  protected readonly recentOrders = computed(() =>
    [...this.orders.items()]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5),
  );
  protected readonly lowStockItems = computed(() =>
    this.inventory
      .items()
      .filter((i) => stockStatus(i) !== 'In stock')
      .sort((a, b) => a.quantity / a.reorderLevel - b.quantity / b.reorderLevel)
      .slice(0, 5),
  );
  protected readonly topSelling = computed(() =>
    TOP_SELLING.map((t) => ({ ...t, product: this.products.getById(t.productId) })).filter(
      (t) => t.product,
    ),
  );

  protected readonly stockStatus = stockStatus;
}
