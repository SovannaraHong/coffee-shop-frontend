import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LockoutService } from '../../../../../../libs/services/Lockout/Lockout.service';

const LOGIN_ROUTE = '/front/login';
const DEFAULT_WAIT_SECONDS = 60;
const MAX_WAIT_SECONDS = 24 * 3600;

@Component({
  imports: [],
  selector: 'app-rate-limit',
  styleUrl: './rate-limit.css',
  templateUrl: './rate-limit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RateLimit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly lockout = inject(LockoutService);
  private readonly destroyRef = inject(DestroyRef);

  // Stored lock (survives reloads) wins, then ?retryAfter=, then the default.
  private readonly endsAt = this.resolveEndsAt();
  protected readonly total = Math.max(1, Math.ceil((this.endsAt - Date.now()) / 1000));

  protected readonly circumference = 2 * Math.PI * 44;
  protected readonly remaining = signal(this.total);
  protected readonly isReady = computed(() => this.remaining() === 0);
  protected readonly dashOffset = computed(
    () => this.circumference * (1 - this.remaining() / this.total),
  );

  constructor() {
    const tick = () => {
      this.remaining.set(Math.max(0, Math.ceil((this.endsAt - Date.now()) / 1000)));
      if (this.remaining() === 0) {
        clearInterval(id);
        this.continueToLogin();
      }
    };
    const id = setInterval(tick, 500);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  protected continueToLogin(): void {
    this.lockout.clear();
    void this.router.navigateByUrl(LOGIN_ROUTE, { replaceUrl: true });
  }

  protected goHome(): void {
    void this.router.navigate(['/']);
  }

  protected goBack(): void {
    this.location.back();
  }

  private resolveEndsAt(): number {
    const stored = this.lockout.until();
    if (stored) return stored;

    const raw = Number(this.route.snapshot.queryParamMap.get('retryAfter'));
    const seconds =
      Number.isFinite(raw) && raw > 0
        ? Math.min(Math.ceil(raw), MAX_WAIT_SECONDS)
        : DEFAULT_WAIT_SECONDS;
    return Date.now() + seconds * 1000;
  }
}
