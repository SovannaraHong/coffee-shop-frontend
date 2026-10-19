import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  host: { '(document:keydown.escape)': 'open() && cancelled.emit()' },
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
          (click)="cancelled.emit()"
        ></div>

        <!-- Dialog -->
        <div
          role="alertdialog"
          aria-modal="true"
          class="relative w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-2xl"
        >
          <button
            type="button"
            aria-label="Close"
            class="absolute right-4 top-4 grid size-8 place-items-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            (click)="cancelled.emit()"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="flex flex-col items-center text-center">
            <span class="grid size-16 place-items-center rounded-full bg-red-50">
              <span
                class="grid size-11 place-items-center rounded-full bg-red-100 text-lg text-red-500"
              >
                <i class="fa-regular fa-trash-can"></i>
              </span>
            </span>
            <h2 class="mt-4 text-xl font-semibold text-neutral-900">{{ title() }}</h2>
            <p class="mt-2 text-[15px] text-neutral-600">{{ message() }}</p>
            <p class="mt-1 text-[13px] text-neutral-400">This action cannot be undone.</p>
          </div>

          <!-- Delete (left) · Cancel (right) -->
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="h-11 rounded-md bg-red-500 text-[15px] font-medium text-white transition hover:bg-red-600"
              (click)="confirmed.emit()"
            >
              {{ confirmLabel() }}
            </button>
            <button
              type="button"
              class="h-11 rounded-md border border-neutral-200 bg-white text-[15px] text-neutral-800 transition hover:bg-neutral-50"
              (click)="cancelled.emit()"
            >
              {{ cancelLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  readonly open = input.required<boolean>();
  readonly title = input('Are you sure?');
  readonly message = input('Do you want to continue?');
  readonly confirmLabel = input('Delete');
  readonly cancelLabel = input('Cancel');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
