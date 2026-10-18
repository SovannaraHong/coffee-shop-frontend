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
import {
  STAFF_ROLES,
  STAFF_SHIFTS,
  STAFF_STATUSES,
  Staff,
  StaffRole,
  StaffShift,
  StaffStatus,
} from '../../../core/models/staff';

export interface StaffPayload {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  shift: StaffShift;
  status: StaffStatus;
}

@Component({
  selector: 'app-staff-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './staff-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class StaffDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly staff = input<Staff | null>(null);

  readonly closed = output<void>();
  readonly saved = output<StaffPayload>();

  protected readonly roles = STAFF_ROLES;
  protected readonly shifts = STAFF_SHIFTS;
  protected readonly statuses = STAFF_STATUSES;

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['Barista' as StaffRole],
    shift: ['Morning' as StaffShift],
    status: ['Active' as StaffStatus],
  });

  constructor() {
    // Render on top of the whole app (above the top bar and sidebar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const s = this.staff();
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

  private load(s: Staff | null): void {
    this.form.reset(
      s
        ? {
            name: s.name,
            email: s.email,
            phone: s.phone,
            role: s.role,
            shift: s.shift,
            status: s.status,
          }
        : { name: '', email: '', phone: '', role: 'Barista', shift: 'Morning', status: 'Active' },
    );
    this.form.markAsUntouched();
  }

  protected setRole(r: StaffRole): void {
    this.form.controls.role.setValue(r);
  }
  protected setShift(s: StaffShift): void {
    this.form.controls.shift.setValue(s);
  }
  protected setStatus(s: StaffStatus): void {
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
