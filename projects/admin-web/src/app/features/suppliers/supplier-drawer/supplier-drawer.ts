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
import { Supplier, SupplierStatus } from '../../../core/models/supplier';

export interface SupplierPayload {
  name: string;
  contact: string;
  email: string;
  phone: string;
  supplies: string;
  status: SupplierStatus;
}

@Component({
  selector: 'app-supplier-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class SupplierDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly supplier = input<Supplier | null>(null);

  readonly closed = output<void>();
  readonly saved = output<SupplierPayload>();

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    contact: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    supplies: [''],
    status: ['Active' as SupplierStatus],
  });

  constructor() {
    // Render on top of the whole app (above the top bar and sidebar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const s = this.supplier();
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

  private load(s: Supplier | null): void {
    if (s) {
      this.form.reset({
        name: s.name,
        contact: s.contact,
        email: s.email,
        phone: s.phone,
        supplies: s.supplies,
        status: s.status,
      });
    } else {
      this.form.reset({
        name: '',
        contact: '',
        email: '',
        phone: '',
        supplies: '',
        status: 'Active',
      });
    }
    this.form.markAsUntouched();
  }

  protected setStatus(s: SupplierStatus): void {
    this.form.controls.status.setValue(s);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
