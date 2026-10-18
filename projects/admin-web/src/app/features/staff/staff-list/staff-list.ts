import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { STAFF_ROLES, Staff } from '../../../core/models/staff';
import { StaffService } from '../../../core/services/staff-service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { StaffDrawer, StaffPayload } from '../staff-drawer/staff-drawer';

@Component({
  selector: 'app-staff-list',
  imports: [DatePipe, PageHeader, ConfirmDialog, StatusBadge, StaffDrawer],
  templateUrl: './staff-list.html',
})
export class StaffList {
  private readonly service = inject(StaffService);

  protected readonly roles = STAFF_ROLES;

  protected readonly search = signal('');
  protected readonly role = signal('all');
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Staff | null>(null);
  protected readonly toDelete = signal<Staff | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.service
      .items()
      .filter(
        (s) =>
          (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
          (this.role() === 'all' || s.role === this.role()),
      );
  });

  protected roleCount(r: string): number {
    return r === 'all'
      ? this.service.items().length
      : this.service.items().filter((s) => s.role === r).length;
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }
  protected openEdit(s: Staff): void {
    this.editing.set(s);
    this.showForm.set(true);
  }
  protected save(v: StaffPayload): void {
    const current = this.editing();
    if (current) this.service.update(current.id, v);
    else {
      const n = (this.service.items().length % 6) + 1; // cycle through the sample avatars
      this.service.add({
        ...v,
        joinedAt: new Date().toISOString().slice(0, 10),
        avatar: `assets/images/avatar/avatar-${n}.jpg`,
      });
    }
    this.showForm.set(false);
  }
  protected confirmDelete(): void {
    const s = this.toDelete();
    if (s) this.service.remove(s.id);
    this.toDelete.set(null);
  }
}
