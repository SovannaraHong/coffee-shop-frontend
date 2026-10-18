import { Component, computed, input } from '@angular/core';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-donut-chart',
  template: `
    <div class="flex flex-col items-center gap-4 sm:flex-row">
      <div class="relative size-44 shrink-0">
        <svg viewBox="0 0 100 100" class="size-full" role="img" aria-label="Donut chart">
          <circle cx="50" cy="50" r="40" fill="none" class="stroke-neutral-100" stroke-width="12" />
          @for (a of arcs(); track a.label) {
            <circle cx="50" cy="50" r="40" fill="none" stroke-width="12" transform="rotate(-90 50 50)"
              [attr.stroke]="a.color" [attr.stroke-dasharray]="a.dash" [attr.stroke-dashoffset]="a.offset">
              <title>{{ a.label }}: {{ a.value }} ({{ a.pct }}%)</title>
            </circle>
          }
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xl font-bold text-neutral-900">{{ centerValue() }}</span>
          <span class="text-xs text-neutral-500">{{ centerLabel() }}</span>
        </div>
      </div>
      <ul class="w-full space-y-2 text-sm">
        @for (a of arcs(); track a.label) {
          <li class="flex items-center justify-between gap-3">
            <span class="inline-flex items-center gap-2 text-neutral-600"><i class="inline-block size-2.5 rounded-full" [style.background]="a.color"></i>{{ a.label }}</span>
            <span class="font-medium text-neutral-900">{{ a.value }} <span class="font-normal text-neutral-400">· {{ a.pct }}%</span></span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class DonutChart {
  readonly segments = input.required<DonutSegment[]>();
  readonly centerValue = input('');
  readonly centerLabel = input('');

  protected readonly arcs = computed(() => {
    const C = 2 * Math.PI * 40;
    const total = this.segments().reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    return this.segments().map((s) => {
      const len = (s.value / total) * C;
      const arc = { ...s, pct: Math.round((s.value / total) * 100), dash: `${Math.max(0, len - 1.5)} ${C - Math.max(0, len - 1.5)}`, offset: -acc };
      acc += len;
      return arc;
    });
  });
}
