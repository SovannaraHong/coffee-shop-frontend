import { Component, computed, input } from '@angular/core';
import { ChartSeries, compact, money, niceMax } from '../chart-utils';

/** Grouped bar chart (plain SVG). Pass colors: Sales '#f59e86', Purchase '#e8643c'. */
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.html',
})
export class BarChart {
  readonly labels = input.required<string[]>();
  readonly series = input.required<ChartSeries[]>();
  readonly prefix = input('');
  readonly yTitle = input('$ (thousands)');

  protected readonly W = 640;
  protected readonly H = 310;
  protected readonly L = 56;
  protected readonly R = 8;
  protected readonly T = 10;
  private readonly B = 30;
  protected readonly plotH = this.H - this.T - this.B;

  private readonly max = computed(() =>
    niceMax(Math.max(1, ...this.series().flatMap((s) => s.data))),
  );

  protected readonly ticks = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const value = (this.max() / 6) * i;
      return {
        value,
        y: this.T + this.plotH - (value / this.max()) * this.plotH,
        label: compact(value, this.prefix()),
      };
    }),
  );

  protected readonly groups = computed(() => {
    const labels = this.labels();
    const series = this.series();
    const slot = (this.W - this.L - this.R) / labels.length;
    const barW = Math.min(24, (slot * 0.8) / series.length);
    return labels.map((label, i) => {
      const cx = this.L + slot * i + slot / 2;
      const start = cx - (barW * series.length) / 2;
      const bars = series.map((s, j) => {
        const v = s.data[i] ?? 0;
        const h = (v / this.max()) * this.plotH;
        return {
          name: s.name,
          color: s.color,
          x: start + j * barW,
          w: barW,
          h,
          y: this.T + this.plotH - h,
          text: money(v, this.prefix()),
        };
      });
      return { label, cx, bars };
    });
  });
}
