import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="inline-flex items-center gap-3">
      <!-- Coffee shop image logo -->
      <div
        class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
      >
        <img
          src="/assets/images/logo-text.webp"
          alt="Brewly logo"
          class="size-full object-contain p-1"
        />
      </div>

      <!-- Brand name -->
      @if (!compact()) {
        <div class="flex flex-col leading-tight">
          <span class="text-lg font-bold tracking-tight text-white">
            Brewly<span class="text-primary">.</span>
          </span>

          <span class="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Coffee & Eatery
          </span>
        </div>
      }
    </div>
  `,
})
export class Logo {
  readonly compact = input(false);
}
