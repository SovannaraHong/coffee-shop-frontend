import { DOCUMENT } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { PermissionPayload } from '../../../../../../../libs/models/permission/permission-request.model';
import { PermissionResponse } from '../../../../../../../libs/models/permission/permission-response.model';
import {
  actionBadge,
  PERMISSION_ACTIONS,
  permissionAction,
  permissionModule,
} from '../../../../../../../libs/models/permission/permission.util';

@Component({
  selector: 'app-permission-drawer',
  templateUrl: './permission-drawer.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class PermissionDrawer {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly permission = input<PermissionResponse | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<PermissionPayload>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly touched = signal(false);
  protected readonly formError = signal('');

  protected readonly actions = PERMISSION_ACTIONS;
  protected readonly badge = actionBadge;
  protected readonly isEdit = computed(() => !!this.permission());

  protected readonly nameInvalid = computed(() => !/^[A-Z0-9_]+$/.test(this.name()));

  protected readonly moduleKey = computed(() => (this.name() ? permissionModule(this.name()) : ''));
  protected readonly actionKey = computed(() => permissionAction(this.name()));

  constructor() {
    // Move the drawer to <body> so it overlays the whole layout
    this.doc.body.appendChild(this.host.nativeElement);
    this.destroyRef.onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      const isOpen = this.open();
      const permission = this.permission();
      untracked(() => {
        if (isOpen) {
          this.populate(permission);
          this.mounted.set(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => this.shown.set(true));
          });
        } else {
          this.shown.set(false);
        }
      });
    });
  }

  private populate(permission: PermissionResponse | null): void {
    this.formError.set('');
    this.touched.set(false);
    this.name.set(permission?.name ?? '');
    this.description.set(permission?.description ?? '');
  }

  /** Typing is normalised to UPPER_SNAKE_CASE */
  protected onName(value: string): void {
    this.name.set(
      value
        .toUpperCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^A-Z0-9_]/g, ''),
    );
  }

  /** Quick action chips: replace the action part, or append it */
  protected setAction(action: string): void {
    const current = this.name();
    const i = current.lastIndexOf('_');
    const last = i >= 0 ? current.slice(i + 1) : '';
    const known = [...PERMISSION_ACTIONS, 'VIEW', 'ADD', 'EDIT', 'REMOVE'] as string[];

    if (i >= 0 && known.includes(last)) {
      this.name.set(`${current.slice(0, i)}_${action}`);
    } else if (current) {
      this.name.set(`${current.replace(/_+$/, '')}_${action}`);
    } else {
      this.name.set(`_${action}`);
    }
  }

  protected requestClose(): void {
    if (!this.saving()) this.closed.emit();
  }

  protected onEscape(): void {
    if (this.open()) this.requestClose();
  }

  protected submit(): void {
    if (this.saving()) return;
    this.touched.set(true);

    const name = this.name().trim();
    if (!name || this.nameInvalid()) {
      this.formError.set('Use capital letters, numbers and underscores, e.g. PRODUCT_READ.');
      return;
    }
    if (name.length > 100) {
      this.formError.set('Permission name must be 100 characters or fewer.');
      return;
    }
    if (this.description().length > 255) {
      this.formError.set('Description must be 255 characters or fewer.');
      return;
    }

    this.formError.set('');
    this.saved.emit({ name, description: this.description().trim() });
  }
}
