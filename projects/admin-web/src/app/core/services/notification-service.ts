import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClient } from '../../../../../../libs/api/api-client';
import { API_URL } from '../../../../../../libs/api/api-config';
import { OrderResponse } from '../../../../../../libs/models/order/order-response.model';
import { OrderStatus } from '../../../../../../libs/models/order/order-status.enum';
import { IngredientService } from './ingredient-service';

export interface AppNotification {
  id: string;
  type: 'order' | 'payment' | 'low_stock';
  icon: string;
  tone: string;
  title: string;
  text: string;
  time: Date;
  read: boolean;
}

interface SeenStore {
  orders: number[];
  payments: number[];
  lowStock: number[];
}

const POLL_MS = 30_000; // 30 seconds
const STORAGE_KEY = 'brewly_seen_notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiClient);
  private readonly apiUrl = inject(API_URL);
  private readonly ingredientService = inject(IngredientService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly audio = new Audio('assets/sound/notification.mp3');

  // ── State ────────────────────────────────────────────────────────
  private readonly _items = signal<AppNotification[]>([]);
  private readonly _toasts = signal<AppNotification[]>([]);

  /** All notifications (bell dropdown) */
  readonly items = this._items.asReadonly();
  /** Active toast popups (auto-dismissed) */
  readonly toasts = this._toasts.asReadonly();

  /** Unread count for bell badge */
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  // Track seen IDs so we never alert twice on the same thing
  private seenOrderIds = new Set<number>();
  private seenPaymentIds = new Set<number>();
  private seenLowStockIds = new Set<number>();
  private initialized = false;
  private firstRun = true; // no saved data yet => seed silently

  // ── Public API ───────────────────────────────────────────────────

  /** Start polling. Call once from Layout. */
  start(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.loadSeen();

    // Run once immediately, then keep polling
    void this.poll().then(() => {
      const timer = setInterval(() => void this.poll(), POLL_MS);
      this.destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  markAllRead(): void {
    this._items.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  dismissToast(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  // ── Persistence ──────────────────────────────────────────────────

  private loadSeen(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return; // firstRun stays true
      const data = JSON.parse(raw) as SeenStore;
      this.seenOrderIds = new Set(data.orders);
      this.seenPaymentIds = new Set(data.payments);
      this.seenLowStockIds = new Set(data.lowStock);
      this.firstRun = false;
    } catch {
      // ignore corrupted storage
    }
  }

  private saveSeen(): void {
    try {
      const data: SeenStore = {
        orders: [...this.seenOrderIds],
        payments: [...this.seenPaymentIds],
        lowStock: [...this.seenLowStockIds],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }

  // ── Polling ──────────────────────────────────────────────────────

  private async poll(): Promise<void> {
    const before = this._items().length;

    await this.pollOrders();
    this.pollLowStock();

    this.saveSeen();
    this.firstRun = false;

    // Play ONE sound per poll, only if something new was added
    if (this._items().length > before) this.playSound();
  }

  private async pollOrders(): Promise<void> {
    try {
      const orders = await firstValueFrom(
        this.api.get<OrderResponse[]>(`${this.apiUrl}/orders/all`),
      );

      for (const order of orders ?? []) {
        // ── New order ──────────────────────────────────────────────
        if (!this.seenOrderIds.has(order.id)) {
          this.seenOrderIds.add(order.id);
          if (!this.firstRun) {
            this.push({
              type: 'order',
              icon: 'fa-bag-shopping',
              tone: 'bg-[#fde3da] text-[#e8643c]',
              title: `New Order ${order.orderNumber}`,
              text: `${order.customerName || 'Customer'} placed an order`,
            });
          }
        }

        // ── Payment confirmed (CONFIRMED status = payment received) ─
        if (order.status === OrderStatus.CONFIRMED && !this.seenPaymentIds.has(order.id)) {
          this.seenPaymentIds.add(order.id);
          if (!this.firstRun) {
            const amt = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(order.finalAmount ?? 0);
            this.push({
              type: 'payment',
              icon: 'fa-circle-check',
              tone: 'bg-emerald-100 text-emerald-600',
              title: 'Payment Received',
              text: `${amt} paid — Order ${order.orderNumber}`,
            });
          }
        }
      }
    } catch {
      // network error — silent
    }
  }

  private pollLowStock(): void {
    const items = this.ingredientService.items();
    if (!items.length) return; // not loaded yet, try next poll

    for (const ing of items) {
      if (ing.isLowStock) {
        if (!this.seenLowStockIds.has(ing.id)) {
          this.seenLowStockIds.add(ing.id);
          if (!this.firstRun) {
            this.push({
              type: 'low_stock',
              icon: 'fa-triangle-exclamation',
              tone: 'bg-amber-100 text-amber-600',
              title: 'Low Stock Alert',
              text: `${ing.name} is below reorder level (${ing.quantityInStock} ${ing.unit})`,
            });
          }
        }
      } else {
        // Restocked: allow a future alert if it drops low again
        this.seenLowStockIds.delete(ing.id);
      }
    }
  }

  private push(data: Omit<AppNotification, 'id' | 'time' | 'read'>): void {
    const n: AppNotification = {
      ...data,
      id: `${Date.now()}-${Math.random()}`,
      time: new Date(),
      read: false,
    };

    // Add to persistent list (newest first)
    this._items.update((list) => [n, ...list].slice(0, 50));

    // Show toast (auto-dismiss after 5 s)
    this._toasts.update((list) => [n, ...list]);
    setTimeout(() => this.dismissToast(n.id), 5_000);
  }

  private playSound(): void {
    this.audio.currentTime = 0;
    this.audio.volume = 0.6; // 0 to 1
    this.audio.play().catch(() => {
      // Browser blocked autoplay until the user interacts with the page
    });
  }
}
