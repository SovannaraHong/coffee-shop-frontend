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
import { RolePayload } from '../../../../../../../libs/models/role/role-request.model';
import { RoleResponse } from '../../../../../../../libs/models/role/role-response.model';
import { PermissionResponse } from '../../../../../../../libs/models/permission/permission-response.model';
import {
  actionBadge,
  isReadAction,
  permissionAction,
  permissionModule,
} from '../../../../../../../libs/models/permission/permission.util';

interface ModuleGroup {
  key: string;
  items: PermissionResponse[];
}

@Component({
  selector: 'app-role-drawer',
  templateUrl: './role-drawer.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class RoleDrawer {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly role = input<RoleResponse | null>(null);
  readonly permissions = input<PermissionResponse[]>([]);
  readonly permissionsLoading = input(false);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<RolePayload>();
  readonly retryPermissions = output<void>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected readonly name = signal('');
  protected readonly nameTouched = signal(false);
  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly permSearch = signal('');
  protected readonly activeKey = signal<string | null>(null);
  protected readonly formError = signal('');

  protected readonly badge = actionBadge;
  protected readonly actionOf = permissionAction;

  protected readonly isEdit = computed(() => !!this.role());
  protected readonly nameInvalid = computed(() => this.name().trim().length === 0);
  protected readonly selectedCount = computed(() => this.selectedIds().size);
  protected readonly totalCount = computed(() => this.permissions().length);

  /** Permissions filtered by search and grouped by module */
  protected readonly groups = computed<ModuleGroup[]>(() => {
    const query = this.permSearch().trim().toLowerCase();
    const map = new Map<string, PermissionResponse[]>();

    for (const p of this.permissions()) {
      if (
        query &&
        !p.name.toLowerCase().includes(query) &&
        !(p.description ?? '').toLowerCase().includes(query)
      ) {
        continue;
      }
      const key = permissionModule(p.name);
      map.set(key, [...(map.get(key) ?? []), p]);
    }

    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        key,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  });

  /** Module shown on the right. Falls back to the first one when the search hides it. */
  protected readonly active = computed<ModuleGroup | null>(() => {
    const groups = this.groups();
    return groups.find((g) => g.key === this.activeKey()) ?? groups[0] ?? null;
  });

  constructor() {
    // Move the drawer to <body> so it overlays the whole layout
    this.doc.body.appendChild(this.host.nativeElement);
    this.destroyRef.onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      const isOpen = this.open();
      const role = this.role();
      untracked(() => {
        if (isOpen) {
          this.populate(role);
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

  private populate(role: RoleResponse | null): void {
    this.formError.set('');
    this.nameTouched.set(false);
    this.permSearch.set('');
    this.activeKey.set(null);
    this.name.set(role?.name ?? '');
    this.selectedIds.set(new Set((role?.permissions ?? []).map((p) => p.id)));
  }

  protected formatModule(key: string): string {
    return key.toLowerCase().replaceAll('_', ' ');
  }

  // ---------- Selection ----------

  protected has(id: number): boolean {
    return this.selectedIds().has(id);
  }

  protected toggle(id: number): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected selectedIn(group: ModuleGroup): number {
    return group.items.filter((p) => this.has(p.id)).length;
  }

  protected allIn(group: ModuleGroup): boolean {
    return group.items.length > 0 && this.selectedIn(group) === group.items.length;
  }

  protected progress(group: ModuleGroup): number {
    return group.items.length ? (this.selectedIn(group) / group.items.length) * 100 : 0;
  }

  protected toggleGroup(group: ModuleGroup): void {
    const all = this.allIn(group);
    this.selectedIds.update((set) => {
      const next = new Set(set);
      for (const p of group.items) {
        if (all) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  }

  // ---------- Presets ----------

  protected applyPreset(preset: 'read' | 'full' | 'none'): void {
    const all = this.permissions();
    if (preset === 'none') {
      this.selectedIds.set(new Set());
    } else if (preset === 'full') {
      this.selectedIds.set(new Set(all.map((p) => p.id)));
    } else {
      this.selectedIds.set(new Set(all.filter((p) => isReadAction(p.name)).map((p) => p.id)));
    }
  }

  // ---------- Close / submit ----------

  protected requestClose(): void {
    if (!this.saving()) this.closed.emit();
  }

  protected onEscape(): void {
    if (this.open()) this.requestClose();
  }

  protected submit(): void {
    if (this.saving()) return;

    this.nameTouched.set(true);
    if (this.nameInvalid()) {
      this.formError.set('Role name is required.');
      return;
    }
    if (this.name().trim().length > 100) {
      this.formError.set('Role name must be 100 characters or fewer.');
      return;
    }

    this.formError.set('');
    this.saved.emit({
      name: this.name().trim().toUpperCase(),
      permissionIds: [...this.selectedIds()],
    });
  }
}
