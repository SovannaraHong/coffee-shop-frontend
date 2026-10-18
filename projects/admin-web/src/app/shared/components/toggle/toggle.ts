import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <button type="button" role="switch" class="relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
      [class]="checked() ? 'bg-primary' : 'bg-neutral-300'" [attr.aria-checked]="checked()" [attr.aria-label]="label()"
      (click)="checked.set(!checked())">
      <span class="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform" [class]="checked() ? 'translate-x-5' : ''"></span>
    </button>
  `,
})
export class Toggle {
  readonly checked = model(false);
  readonly label = input('Toggle');
}
