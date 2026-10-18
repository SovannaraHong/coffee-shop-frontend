import { Component, computed, input } from '@angular/core';

const GREEN = 'bg-[#d9f7e6] text-[#00b44a]';
const AMBER = 'bg-[#fff1c9] text-[#e0a100]';
const ORANGE = 'bg-[#fde3da] text-[#e8643c]';
const RED = 'bg-[#fde0e0] text-[#ef4444]';
const SKY = 'bg-[#d9f3fa] text-[#00a6c4]';
const GREY = 'bg-neutral-100 text-neutral-600';

const STYLES: Record<string, string> = {
  Pending: AMBER,
  Preparing: ORANGE,
  Ready: SKY,
  Completed: GREEN,
  Cancelled: RED,
  Paid: GREEN,
  Refunded: GREY,
  Failed: RED,
  'In stock': GREEN,
  'Low stock': AMBER,
  'Out of stock': RED,
  Active: GREEN,
  'On leave': AMBER,
  Inactive: GREY,
  Available: GREEN,
  Unavailable: GREY,
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
})
export class StatusBadge {
  readonly status = input.required<string>();
  protected readonly cls = computed(() => STYLES[this.status()] ?? GREY);
}
