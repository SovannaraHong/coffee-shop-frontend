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
import { SupplierResponse } from '../../../../../../../libs/models/supplier/supplier-response.model';
import { SupplierPayload } from '../../../../../../../libs/models/supplier/supplier-requrest.model';

@Component({
  selector: 'app-supplier-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-drawer.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class SupplierDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly supplier = input<SupplierResponse | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<SupplierPayload>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    contactPerson: ['', Validators.maxLength(150)],
    // Same rule as the backend: empty, or 7-20 chars of digits + - ( ) and spaces
    phone: ['', Validators.pattern(/^$|^[0-9+\-() ]{7,20}$/)],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    address: ['', Validators.maxLength(255)],
    isActive: [true],
  });

  constructor() {
    // Move the drawer to <body> so it always sits above the page layout
    this.doc.body.appendChild(this.host.nativeElement);
    this.destroyRef.onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      const isOpen = this.open();
      const supplier = this.supplier();
      untracked(() => {
        if (isOpen) {
          this.populate(supplier);
          this.mounted.set(true);
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        } else {
          this.shown.set(false);
        }
      });
    });
  }

  private populate(s: SupplierResponse | null): void {
    this.form.reset({
      name: s?.name ?? '',
      contactPerson: s?.contactPerson ?? '',
      phone: s?.phone ?? '',
      email: s?.email ?? '',
      address: s?.address ?? '',
      isActive: s?.isActive ?? true,
    });
  }

  protected requestClose(): void {
    if (!this.saving()) this.closed.emit();
  }

  protected onEscape(): void {
    if (this.open()) this.requestClose();
  }

  protected submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: SupplierPayload = {
      name: v.name.trim(),
      contactPerson: v.contactPerson.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      address: v.address.trim(),
    };
    // The create request has no isActive, so only send it when editing
    if (this.supplier()) payload.isActive = v.isActive;

    this.saved.emit(payload);
  }
}
