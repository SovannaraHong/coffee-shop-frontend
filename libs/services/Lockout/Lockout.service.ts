import { Injectable } from '@angular/core';

const KEY = 'auth_lockout_until';
@Injectable({ providedIn: 'root' })
export class LockoutService {
  set(second: number): void {
    try {
      localStorage.setItem(KEY, String(Date.now() + second * 1000));
    } catch (error) {}
  }
  /** Epoch ms when the lock ends, or null if none/expired. */
  until(): number | null {
    try {
      const v = Number(localStorage.getItem(KEY));
      if (Number.isFinite(v) && v > Date.now()) return v;
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return null;
  }

  remainingSeconds(): number {
    const u = this.until();
    return u ? Math.max(0, Math.ceil((u - Date.now()) / 1000)) : 0;
  }

  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}
