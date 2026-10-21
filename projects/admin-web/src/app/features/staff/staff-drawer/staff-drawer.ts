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
import { StaffRequest } from '../../../../../../../libs/models/staff/staff-request.model';
import { Staff } from '../../../../../../../libs/api/staff/staff';
import { RoleService } from '../../../core/services/role-service';

export interface StaffPayload extends StaffRequest {
  isActive: boolean;
  imageFile: File | null;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-staff-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './staff-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class StaffDrawer {
  private readonly roleService = inject(RoleService);
  protected readonly roles = this.roleService.items;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly open = input(false);
  readonly staff = input<Staff | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<StaffPayload>();

  /** Rendered at all (only after the first open) */
  protected readonly mounted = signal(false);
  /** Drives the slide animation */
  protected readonly shown = signal(false);

  // avatar picker
  protected readonly imageFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly imageError = signal<string | null>(null);
  private blobUrl: string | null = null;

  protected readonly form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roleId: [0, [Validators.required, Validators.min(1)]],
    isActive: [true],
  });

  constructor() {
    // Render on top of the whole app (above the top bar and sidebar)
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => {
      this.revokeBlob();
      this.host.nativeElement.remove();
    });

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
    const list = this.roles();
    const roleId = s
      ? (list.find((r) => r.name === s.roleName)?.id ?? list[0]?.id ?? 0)
      : (list[0]?.id ?? 0);

    this.form.reset({
      fullName: s?.fullName ?? '',
      email: s?.email ?? '',
      roleId,
      isActive: s?.isActive ?? true,
    });

    // email can't change after the account (and Keycloak user) exists
    if (s) this.form.controls.email.disable();
    else this.form.controls.email.enable();
    this.form.markAsUntouched();

    // reset avatar picker
    this.revokeBlob();
    this.imageFile.set(null);
    this.imageError.set(null);
    this.previewUrl.set(s?.avatarUrl ?? null);
  }

  protected setRole(id: number): void {
    this.form.controls.roleId.setValue(id);
  }

  protected setActive(v: boolean): void {
    this.form.controls.isActive.setValue(v);
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow picking the same file again
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.imageError.set('Use a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError.set('Image must be 2 MB or smaller.');
      return;
    }

    this.imageError.set(null);
    this.revokeBlob();
    this.blobUrl = URL.createObjectURL(file);
    this.imageFile.set(file);
    this.previewUrl.set(this.blobUrl);
  }

  protected removeNewImage(): void {
    this.revokeBlob();
    this.imageFile.set(null);
    this.imageError.set(null);
    this.previewUrl.set(this.staff()?.avatarUrl ?? null);
  }

  private revokeBlob(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  protected initials(): string {
    return (
      this.form.controls.fullName.value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || '?'
    );
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    // getRawValue() includes the disabled email, so edits still send it
    this.saved.emit({ ...this.form.getRawValue(), imageFile: this.imageFile() });
  }
}
