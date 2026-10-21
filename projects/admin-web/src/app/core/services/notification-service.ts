import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClient } from '../../../../../../libs/api/api-client';
import { API_URL } from '../../../../../../libs/api/api-config';
import { OrderResponse } from '../../../../../../libs/models/order/order-response.model';
import { PaymentResponse } from '../../../../../../libs/models/payment/payment-response';
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

const POLL_MS = 30_000; // 30 seconds

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

  // Track seen IDs so we don't re-alert on the same order/payment
  private seenOrderIds = new Set<number>();
  private seenPaymentIds = new Set<number>();
  private seenLowStockIds = new Set<number>();
  private initialized = false;

  // ── Public API ───────────────────────────────────────────────────

  /** Start polling. Call once from Layout. */
  start(): void {
    if (this.initialized) return;
    this.initialized = true;

    // First fetch — just seed known IDs without generating notifications
    void this.seedKnown().then(() => {
      // Then start the live poll
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

  // ── Private ──────────────────────────────────────────────────────

  /** Seed known order/payment/ingredient IDs on first load — no notifications. */
  private async seedKnown(): Promise<void> {
    try {
      const orders = await firstValueFrom(
        this.api.get<OrderResponse[]>(`${this.apiUrl}/orders/all`),
      );
      (orders ?? []).forEach((o) => this.seenOrderIds.add(o.id));
    } catch {
      // ignore seed errors
    }

    // Seed low-stock ingredients
    for (const i of this.ingredientService.items()) {
      if (i.isLowStock) this.seenLowStockIds.add(i.id);
    }
  }

  /** Called every POLL_MS to detect new activity. */
  private async poll(): Promise<void> {
    await Promise.all([this.pollOrders(), this.pollLowStock()]);
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
          this.push({
            type: 'order',
            icon: 'fa-bag-shopping',
            tone: 'bg-[#fde3da] text-[#e8643c]',
            title: `New Order ${order.orderNumber}`,
            text: `${order.customerName || 'Customer'} placed an order`,
          });
        }

        // ── Payment confirmed (order just became CONFIRMED) ────────
        // We treat CONFIRMED status as "payment received"
        if (order.status === OrderStatus.CONFIRMED && !this.seenPaymentIds.has(order.id)) {
          this.seenPaymentIds.add(order.id);
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
    } catch {
      // network error — silent
    }
  }

  private pollLowStock(): void {
    for (const ing of this.ingredientService.items()) {
      if (ing.isLowStock && !this.seenLowStockIds.has(ing.id)) {
        this.seenLowStockIds.add(ing.id);
        this.push({
          type: 'low_stock',
          icon: 'fa-triangle-exclamation',
          tone: 'bg-amber-100 text-amber-600',
          title: 'Low Stock Alert',
          text: `${ing.name} is below reorder level (${ing.quantityInStock} ${ing.unit})`,
        });
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

    // Play notification sound
    this.playSound();
  }

  // private playSound(): void {
  //   try {
  //     const ctx = new AudioContext();
  //     const osc = ctx.createOscillator();
  //     const gain = ctx.createGain();
  //     osc.connect(gain);
  //     gain.connect(ctx.destination);

  //     osc.type = 'sine';
  //     osc.frequency.setValueAtTime(880, ctx.currentTime);
  //     osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
  //     gain.gain.setValueAtTime(0.3, ctx.currentTime);
  //     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  //     osc.start(ctx.currentTime);
  //     osc.stop(ctx.currentTime + 0.4);
  //   } catch {
  //     // AudioContext not available (e.g. no user gesture yet) — silent
  //   }
  // }
  private playSound(): void {
    this.audio.currentTime = 0;
    this.audio.volume = 0.6; // 0 to 1
    this.audio.play().catch(() => {
      // Browser blocked autoplay until the user interacts with the page
    });
  }
}
