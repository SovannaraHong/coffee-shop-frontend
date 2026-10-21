import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { StaffService } from '../../../core/services/staff-service';
import { RoleService } from '../../../core/services/role-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StaffDrawer, StaffPayload } from '../staff-drawer/staff-drawer';
import { Staff } from '../../../../../../../libs/api/staff/staff';

type StatusFilter = 'all' | 'active' | 'inactive';

// Full class names so Tailwind can see them
const ROLE_BADGES = [
  'bg-sky-50 text-sky-700 ring-sky-200',
  'bg-violet-50 text-violet-700 ring-violet-200',
  'bg-amber-50 text-amber-700 ring-amber-200',
  'bg-teal-50 text-teal-700 ring-teal-200',
  'bg-pink-50 text-pink-700 ring-pink-200',
];

const AVATAR_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-pink-100 text-pink-700',
];

@Component({
  selector: 'app-staff-list',
  imports: [PageHeader, ConfirmDialog, StaffDrawer],
  templateUrl: './staff-list.html',
})
export class StaffList implements OnInit {
  protected readonly service = inject(StaffService);
  protected readonly roleService = inject(RoleService);

  protected readonly tabs = computed(() => ['all', ...this.roleService.items().map((r) => r.name)]);

  protected readonly search = signal('');
  protected readonly role = signal('all');
  protected readonly status = signal<StatusFilter>('all');

  protected readonly showForm = signal(false);
  protected readonly editing = signal<Staff | null>(null);
  protected readonly toDelete = signal<Staff | null>(null);
  protected readonly togglingId = signal<number | null>(null);

  // ids whose avatar failed to load (403, 404...) -> show initials instead
  private readonly failedImages = signal<Set<number>>(new Set());

  protected readonly skeleton = [1, 2, 3, 4, 5];

  protected readonly stats = computed(() => {
    const list = this.service.items();
    const active = list.filter((s) => s.isActive).length;
    return { total: list.length, active, inactive: list.length - active };
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.service.items().filter((s) => {
      const matchSearch =
        !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchRole = this.role() === 'all' || s.roleName === this.role();
      const matchStatus = this.status() === 'all' || (this.status() === 'active') === s.isActive;
      return matchSearch && matchRole && matchStatus;
    });
  });

  protected readonly hasFilters = computed(
    () => !!this.search().trim() || this.role() !== 'all' || this.status() !== 'all',
  );

  ngOnInit(): void {
    this.roleService.load();
    this.service.load();
  }

  protected roleCount(r: string): number {
    const list = this.service.items();
    return r === 'all' ? list.length : list.filter((s) => s.roleName === r).length;
  }

  protected clearFilters(): void {
    this.search.set('');
    this.role.set('all');
    this.status.set('all');
  }

  protected setStatusFilter(v: StatusFilter): void {
    this.status.set(this.status() === v ? 'all' : v);
  }

  // ----- avatar helpers -----
  protected showImage(s: Staff): boolean {
    return !!s.avatarUrl && !this.failedImages().has(s.id);
  }

  protected onImgError(s: Staff): void {
    this.failedImages.update((set) => new Set(set).add(s.id));
  }

  protected initials(name: string): string {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || '?'
    );
  }

  private pick(list: string[], key: string): string {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return list[h % list.length];
  }

  protected roleBadge(name: string): string {
    return this.pick(ROLE_BADGES, name);
  }

  protected avatarColor(name: string): string {
    return this.pick(AVATAR_COLORS, name);
  }

  // ----- actions -----
  protected openAdd(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(s: Staff): void {
    this.editing.set(s);
    this.showForm.set(true);
  }

  protected async toggleStatus(s: Staff): Promise<void> {
    if (this.togglingId() !== null) return;
    this.togglingId.set(s.id);
    await this.service.changeStatus(s.id);
    this.togglingId.set(null);
  }

  protected async save(v: StaffPayload): Promise<void> {
    const current = this.editing();
    const { imageFile, ...body } = v;

    const ok = current
      ? await this.service.update(current.id, body, imageFile)
      : await this.service.add(
          { fullName: body.fullName, email: body.email, roleId: body.roleId },
          imageFile,
        );

    if (ok) {
      if (current) {
        // new image url -> allow it to try loading again
        this.failedImages.update((set) => {
          const next = new Set(set);
          next.delete(current.id);
          return next;
        });
      }
      this.showForm.set(false);
    }
  }

  protected async confirmDelete(): Promise<void> {
    const s = this.toDelete();
    if (!s) return;
    await this.service.remove(s.id);
    this.toDelete.set(null);
  }
}
