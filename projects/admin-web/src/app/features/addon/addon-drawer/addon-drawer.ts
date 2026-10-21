import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AddonFormValue } from '../../../../../../../libs/models/addon/addon-request.model';
import { AddonResponse } from '../../../../../../../libs/models/addon/addon-response.model';

@Component({
  selector: 'app-addon-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './addon-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class AddonDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly item = input<AddonResponse | null>(null); // full row (when editing)
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<AddonFormValue>();

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  private readonly defaults: AddonFormValue = {
    name: '',
    price: 0,
    isActive: true,
  };

  protected readonly form = this.fb.group({
    name: [this.defaults.name, [Validators.required, Validators.maxLength(100)]],
    price: [this.defaults.price, [Validators.required, Validators.min(0)]],
    isActive: [this.defaults.isActive],
  });

  constructor() {
    // Render on top of the whole app (above the top bar and sidebar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const s = this.item();
        untracked(() => {
          this.load(s);
          this.mounted.set(true);
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        });
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  private load(s: AddonResponse | null): void {
    this.form.reset(s ? { name: s.name, price: s.price, isActive: s.isActive } : this.defaults);
    this.form.markAsUntouched();
  }

  protected setActive(value: boolean): void {
    this.form.controls.isActive.setValue(value);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
