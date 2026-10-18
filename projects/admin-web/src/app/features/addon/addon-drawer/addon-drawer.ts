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
import { Addon, AddonInput } from '../../../../../../../libs/models/addon/addon';

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
  readonly item = input<Addon | null>(null); // full row (when editing)

  readonly closed = output<void>();
  readonly saved = output<AddonInput>(); // form value only

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  private readonly defaults: AddonInput = {
    name: '',
    price: 0,
    isActive: true,
  };

  protected readonly form = this.fb.group({
    name: [this.defaults.name, Validators.required],
    price: [this.defaults.price, Validators.min(0)],
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

  private load(s: Addon | null): void {
    this.form.reset(
      s
        ? {
            name: s.name,
            price: s.price,
            isActive: s.isActive,
          }
        : this.defaults,
    );
    this.form.markAsUntouched();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
