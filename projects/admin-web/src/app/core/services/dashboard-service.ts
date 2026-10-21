import { Injectable, computed, inject, signal } from '@angular/core';
import { OrderService } from './order-service';
import { IngredientService } from './ingredient-service';
import { ProductService } from './product-service';
import { PurchaseOrderService } from './purchase-order-service';
import { OrderStatus } from '../../../../../../libs/models/order/order-status.enum';
import { OrderResponse } from '../../../../../../libs/models/order/order-response.model';
import { OrderDetailResponse } from '../../../../../../libs/models/order/order-detail-response.model';

export type RevenueRange = 'day' | 'week' | 'month' | 'year';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly orderService = inject(OrderService);
  private readonly ingredientService = inject(IngredientService);
  private readonly productService = inject(ProductService);
  private readonly purchaseOrderService = inject(PurchaseOrderService);

  /** Active time filter for KPI cards */
  readonly rangeFilter = signal<RevenueRange>('day');

  // ── convenience aliases ──────────────────────────────────────────
  private readonly orders = this.orderService.items;
  private readonly ingredients = this.ingredientService.items;
  private readonly products = this.productService.items;
  private readonly purchaseOrders = this.purchaseOrderService.items;

  // ── Revenue-status filter (same as order list) ────────────────────
  private readonly revenueStatuses: OrderStatus[] = [
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.DELIVERING,
    OrderStatus.COMPLETED,
  ];

  // ── Time helpers ─────────────────────────────────────────────────
  private startOf(range: RevenueRange): Date {
    const d = new Date();
    switch (range) {
      case 'day':
        d.setHours(0, 0, 0, 0);
        break;
      case 'week':
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Mon
        break;
      case 'month':
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        break;
      case 'year':
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
        break;
    }
    return d;
  }

  private ordersInRange(orders: OrderResponse[], from: Date): OrderResponse[] {
    return orders.filter((o) => new Date(o.orderDate) >= from);
  }

  // ── KPI cards (react to rangeFilter signal) ────────────────────────
  readonly filteredOrders = computed(() => {
    const from = this.startOf(this.rangeFilter());
    return this.ordersInRange(this.orders(), from);
  });

  readonly totalRevenue = computed(() =>
    this.filteredOrders()
      .filter((o) => this.revenueStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.finalAmount ?? 0), 0),
  );

  readonly orderCount = computed(() => this.filteredOrders().length);

  readonly totalPurchase = computed(() => {
    const from = this.startOf(this.rangeFilter());
    return this.purchaseOrders()
      .filter((p) => new Date(p.orderDate) >= from)
      .reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
  });

  readonly lowStockCount = computed(
    () => this.ingredients().filter((i) => i.isLowStock && i.isActive).length,
  );

  // ── Summary cards (all-time / current month) ────────────────────
  readonly allTimeRevenue = computed(() =>
    this.orders()
      .filter((o) => this.revenueStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.finalAmount ?? 0), 0),
  );

  readonly avgOrderValue = computed(() => {
    const list = this.orders().filter((o) => this.revenueStatuses.includes(o.status));
    return list.length ? this.allTimeRevenue() / list.length : 0;
  });

  readonly allTimePurchase = computed(() =>
    this.purchaseOrders().reduce((sum, p) => sum + (p.totalAmount ?? 0), 0),
  );

  // ── Customer count (unique names in orders) ──────────────────────
  readonly customerCount = computed(
    () => new Set(this.orders().map((o) => o.customerName)).size,
  );

  // ── Recent orders (latest 5) ─────────────────────────────────────
  readonly recentOrders = computed(() =>
    [...this.orders()]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5),
  );

  // ── Low-stock ingredients (bottom 5 by ratio) ────────────────────
  readonly lowStockItems = computed(() =>
    this.ingredients()
      .filter((i) => i.isLowStock && i.isActive)
      .sort((a, b) => a.quantityInStock / a.reorderLevel - b.quantityInStock / b.reorderLevel)
      .slice(0, 5),
  );

  // ── Top-selling products (computed from real order details) ──────
  readonly topSelling = computed(() => {
    // Aggregate sales by productName across all COMPLETED orders
    const map = new Map<string, { units: number; imageUrl: string }>();

    for (const order of this.orders()) {
      if (!this.revenueStatuses.includes(order.status)) continue;
      for (const detail of order.details as OrderDetailResponse[]) {
        const existing = map.get(detail.productName) ?? { units: 0, imageUrl: detail.imageUrl ?? '' };
        map.set(detail.productName, {
          units: existing.units + detail.quantity,
          imageUrl: existing.imageUrl || detail.imageUrl || '',
        });
      }
    }

    const sorted = [...map.entries()]
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 5);

    const total = sorted.reduce((sum, [, v]) => sum + v.units, 0) || 1;

    return sorted.map(([name, v]) => ({
      name,
      units: v.units,
      imageUrl: v.imageUrl,
      share: Math.round((v.units / total) * 100),
    }));
  });

  // ── Sales vs Purchase bar chart ───────────────────────────────────
  // Shows last 7 days by default
  readonly chartLabels = computed(() => {
    const labels: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return labels;
  });

  readonly salesChartData = computed(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      return this.orders()
        .filter((o) => {
          const date = new Date(o.orderDate);
          return (
            this.revenueStatuses.includes(o.status) &&
            date >= dayStart &&
            date <= dayEnd
          );
        })
        .reduce((sum, o) => sum + (o.finalAmount ?? 0), 0);
    });
  });

  readonly purchaseChartData = computed(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      return this.purchaseOrders()
        .filter((p) => {
          const date = new Date(p.orderDate);
          return date >= dayStart && date <= dayEnd;
        })
        .reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
    });
  });

  // ── Supplier count ────────────────────────────────────────────────
  readonly supplierCount = computed(() => {
    const ids = new Set(this.purchaseOrders().map((p) => p.supplierId));
    return ids.size;
  });

  // ── Product count ─────────────────────────────────────────────────
  readonly productCount = computed(() => this.products().length);

  async loadAll(): Promise<void> {
    await Promise.all([
      this.orderService.load(),
      this.ingredientService.load(),
      this.productService.load(),
      this.purchaseOrderService.load(),
    ]);
  }
}
