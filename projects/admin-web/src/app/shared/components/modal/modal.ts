import { Component, input, output } from '@angular/core';

/**
 * <app-modal [open]="show()" title="Add item" (closed)="show.set(false)">
 *   ...body...
 *   <ng-container modal-footer> <button class="btn btn-primary">Save</button> </ng-container>
 * </app-modal>
 */
@Component({
  selector: 'app-modal',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/45 backdrop-blur-[1px]" (click)="closed.emit()"></div>
        <div class="relative max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl" [class]="width()" role="dialog" aria-modal="true">
          <div class="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h3 class="text-base font-semibold text-neutral-900">{{ title() }}</h3>
            <button type="button" class="btn btn-light btn-icon btn-sm" aria-label="Close" (click)="closed.emit()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="px-5 py-4"><ng-content /></div>
          <div class="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-5 py-3">
            <ng-content select="[modal-footer]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input('');
  readonly width = input('max-w-lg');
  readonly closed = output<void>();
}
