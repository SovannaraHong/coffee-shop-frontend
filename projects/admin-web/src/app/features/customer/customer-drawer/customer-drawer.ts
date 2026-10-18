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
import { CustomerResponse } from '../../../../../../../libs/models/customer/customer-response.model';
import { CustomerUpdateRequest } from '../../../../../../../libs/models/customer/customer-request.model';

@Component({
  selector: 'app-customer-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class CustomerDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly customer = input<CustomerResponse | null>(null);

  readonly closed = output<void>();
  readonly saved = output<CustomerUpdateRequest>();

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    isActive: [true],
  });

  constructor() {
    // Render on top of the whole app (above the top bar and sidebar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const c = this.customer();
        untracked(() => {
          this.load(c);
          this.mounted.set(true);
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        });
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  private load(c: CustomerResponse | null): void {
    this.form.reset({
      firstName: c?.firstName ?? '',
      lastName: c?.lastName ?? '',
      phone: c?.phone ?? '',
      isActive: c?.isActive ?? true,
    });
    this.form.markAsUntouched();
  }

  protected setActive(v: boolean): void {
    this.form.controls.isActive.setValue(v);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
