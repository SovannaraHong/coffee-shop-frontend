import { Component, computed, input, signal } from '@angular/core';
import { ChartSeries } from '../chart-utils';

/** Smooth area/line chart with value tags, ₹ axis, hover tooltip (plain SVG). */
@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.html',
})
export class AreaChart {
  readonly labels = input.required<string[]>();
  readonly series = input.required<ChartSeries[]>();
  readonly yMin = input(30000);
  readonly yMax = input(100000);
  readonly yStep = input(10000);
  readonly yTitle = input('Sales (INR)');

  protected readonly W = 1200;
  protected readonly H = 400;
  protected readonly L = 92;
  protected readonly R = 26;
  protected readonly T = 16;
  protected readonly B = 36;
  protected readonly plotH = this.H - this.T - this.B;
  protected readonly base = this.T + this.plotH;

  protected readonly hover = signal<number | null>(null);

  protected fmt(v: number): string {
    return '₹' + new Intl.NumberFormat('en-IN').format(v);
  }

  private x(i: number, n: number): number {
    return this.L + (i * (this.W - this.L - this.R)) / Math.max(1, n - 1);
  }
  private y(v: number): number {
    return this.T + this.plotH - ((v - this.yMin()) / (this.yMax() - this.yMin())) * this.plotH;
  }

  protected readonly ticks = computed(() => {
    const out: { y: number; label: string }[] = [];
    for (let v = this.yMin(); v <= this.yMax(); v += this.yStep())
      out.push({ y: this.y(v), label: this.fmt(v) });
    return out;
  });

  protected readonly cols = computed(() => {
    const n = this.labels().length;
    const slot = (this.W - this.L - this.R) / Math.max(1, n - 1);
    return this.labels().map((label, i) => ({ label, x: this.x(i, n), slot }));
  });

  protected readonly paths = computed(() =>
    this.series().map((s, idx) => {
      const n = s.data.length;
      const pts = s.data.map((v, i) => [this.x(i, n), this.y(v)] as [number, number]);
      const line = this.smooth(pts);
      const area = `${line} L ${pts[n - 1][0]} ${this.base} L ${pts[0][0]} ${this.base} Z`;
      const tags = s.data.map((v, i) => {
        const text = String(v);
        const w = text.length * 6.6 + 8;
        return { text, w, x: pts[i][0] - w / 2, y: pts[i][1] - 8 };
      });
      return { name: s.name, color: s.color, line, area, tags, id: 'areaGrad' + idx };
    }),
  );

  /** Tooltip position (percent of chart width) and rows for the hovered column. */
  protected readonly tip = computed(() => {
    const i = this.hover();
    if (i === null) return null;
    const c = this.cols()[i];
    return {
      label: c.label,
      left: (c.x / this.W) * 100,
      flip: i < 3,
      rows: this.series().map((s) => ({
        name: s.name,
        color: s.color,
        value: this.fmt(s.data[i]),
      })),
    };
  });

  /** Monotone cubic interpolation -> smooth curve without overshoot. */
  private smooth(p: [number, number][]): string {
    const n = p.length;
    if (n < 3) return p.map((q, i) => `${i ? 'L' : 'M'} ${q[0]} ${q[1]}`).join(' ');
    const sec = (i: number) => (p[i + 1][1] - p[i][1]) / (p[i + 1][0] - p[i][0]);
    const t: number[] = new Array(n);
    for (let i = 1; i < n - 1; i++) {
      const h0 = p[i][0] - p[i - 1][0];
      const h1 = p[i + 1][0] - p[i][0];
      const s0 = sec(i - 1);
      const s1 = sec(i);
      const q = (s0 * h1 + s1 * h0) / (h0 + h1);
      t[i] =
        (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(q)) ||
        0;
    }
    t[0] = (3 * sec(0) - t[1]) / 2;
    t[n - 1] = (3 * sec(n - 2) - t[n - 2]) / 2;
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const h = p[i + 1][0] - p[i][0];
      d += ` C ${p[i][0] + h / 3} ${p[i][1] + (t[i] * h) / 3}, ${p[i + 1][0] - h / 3} ${p[i + 1][1] - (t[i + 1] * h) / 3}, ${p[i + 1][0]} ${p[i + 1][1]}`;
    }
    return d;
  }
}
