import { Component, computed, input } from '@angular/core';

type StatTone = 'primary' | 'green' | 'sky' | 'amber' | 'rose';

const TONES: Record<StatTone, { wrap: string; icon: string; text: string }> = {
  primary: { wrap: 'bg-[#fbebe6] border-[#f3b9a7]', icon: 'bg-[#e8643c]', text: 'text-[#e8643c]' },
  green: { wrap: 'bg-[#e6f8ee] border-[#a9e8c5]', icon: 'bg-[#00c853]', text: 'text-[#00c853]' },
  sky: { wrap: 'bg-[#e5f6fb] border-[#a5e1f0]', icon: 'bg-[#00b8d9]', text: 'text-[#00b8d9]' },
  amber: { wrap: 'bg-[#fff6e0] border-[#f6dc9b]', icon: 'bg-[#f2b100]', text: 'text-[#f2b100]' },
  rose: { wrap: 'bg-rose-50 border-rose-200', icon: 'bg-rose-500', text: 'text-rose-500' },
};

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly note = input('');
  readonly tone = input<StatTone>('primary');
  protected readonly t = computed(() => TONES[this.tone()]);
}
