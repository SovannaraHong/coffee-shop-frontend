import { Injectable } from '@angular/core';

interface RateLimitState {
  refreshCount: number;
  windowStart: number;
  blockLevel: number;
  blockedUntil: number;
}

@Injectable({
  providedIn: 'root',
})
export class LoginRateLimitService {
  private readonly STORAGE_KEY = 'login_rate_limit';
  private readonly MAX_REFRESHES = 10;
  private readonly WINDOW_MS = 60 * 1000;
  private readonly FIRST_BLOCK_MS = 60 * 1000;
  private readonly SECOND_BLOCK_MS = 5 * 60 * 1000;

  private getState(): RateLimitState {
    try {
      const saved = sessionStorage.getItem(this.STORAGE_KEY);

      if (saved) {
        return JSON.parse(saved) as RateLimitState;
      }
    } catch {
      // Use the initial state if storage is unavailable.
    }

    return {
      refreshCount: 0,
      windowStart: Date.now(),
      blockLevel: 0,
      blockedUntil: 0,
    };
  }

  private saveState(state: RateLimitState): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be unavailable in some browser environments.
    }
  }

  checkRefresh(): {
    blocked: boolean;
    remainingSeconds: number;
  } {
    const now = Date.now();
    const state = this.getState();

    // A block is still active.
    if (state.blockedUntil > now) {
      return {
        blocked: true,
        remainingSeconds: Math.ceil((state.blockedUntil - now) / 1000),
      };
    }

    // The previous block has expired.
    if (state.blockedUntil > 0) {
      state.blockedUntil = 0;
      state.refreshCount = 0;
      state.windowStart = now;
    }

    // Reset the request counter after one minute.
    if (now - state.windowStart >= this.WINDOW_MS) {
      state.refreshCount = 0;
      state.windowStart = now;
    }

    state.refreshCount++;

    // The 10th page load triggers a block.
    if (state.refreshCount >= this.MAX_REFRESHES) {
      state.blockLevel++;

      const duration = state.blockLevel === 1 ? this.FIRST_BLOCK_MS : this.SECOND_BLOCK_MS;

      state.blockedUntil = now + duration;

      this.saveState(state);

      return {
        blocked: true,
        remainingSeconds: Math.ceil(duration / 1000),
      };
    }

    this.saveState(state);

    return {
      blocked: false,
      remainingSeconds: 0,
    };
  }

  getRemainingSeconds(): number {
    const state = this.getState();

    return Math.max(0, Math.ceil((state.blockedUntil - Date.now()) / 1000));
  }
}
