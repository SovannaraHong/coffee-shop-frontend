import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  selector: 'app-notification-toast',
  imports: [DatePipe],
  template: `
    <div
      aria-live="polite"
      class="pointer-events-none fixed bottom-5 right-5 z-[9999] flex flex-col gap-2"
      style="max-width: 360px"
    >
      @for (t of notifService.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg animate-slide-in"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full text-sm"
            [class]="t.tone"
          >
            <i class="fa-solid" [class]="t.icon"></i>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-neutral-900">{{ t.title }}</p>
            <p class="mt-0.5 text-xs text-neutral-600">{{ t.text }}</p>
            <p class="mt-1 text-[11px] text-neutral-400">{{ t.time | date: 'HH:mm:ss' }}</p>
          </div>
          <button
            type="button"
            class="ml-1 text-neutral-400 hover:text-neutral-700"
            aria-label="Dismiss"
            (click)="notifService.dismissToast(t.id)"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(100%); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in { animation: slide-in 0.25s ease-out; }
  `],
})
export class NotificationToast {
  protected readonly notifService = inject(NotificationService);
}
