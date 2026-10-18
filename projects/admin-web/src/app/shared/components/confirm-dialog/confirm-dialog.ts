import { Component, input, output } from '@angular/core';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal],
  template: `
    <app-modal [open]="open()" [title]="title()" width="max-w-md" (closed)="cancelled.emit()">
      <div class="flex gap-4">
        <div class="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <p class="text-sm text-neutral-600">{{ message() }}</p>
      </div>
      <ng-container modal-footer>
        <button type="button" class="btn btn-outline" (click)="cancelled.emit()">Cancel</button>
        <button type="button" class="btn btn-danger" (click)="confirmed.emit()">{{ confirmLabel() }}</button>
      </ng-container>
    </app-modal>
  `,
})
export class ConfirmDialog {
  readonly open = input.required<boolean>();
  readonly title = input('Are you sure?');
  readonly message = input('This action cannot be undone.');
  readonly confirmLabel = input('Delete');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
