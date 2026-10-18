import { Component, computed, inject, signal } from '@angular/core';
import { CustomerService } from '../../../core/services/customer-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CustomerDrawer } from '../customer-drawer/customer-drawer';
import { CustomerResponse } from '../../../../../../../libs/models/customer/customer-response.model';
import { CustomerUpdateRequest } from '../../../../../../../libs/models/customer/customer-request.model';

type CustomerTab = 'all' | 'active' | 'inactive' | 'unverified';

@Component({
  selector: 'app-customer-list',
  imports: [PageHeader, CustomerDrawer],
  templateUrl: './customer-list.html',
})
export class CustomerList {
  private readonly service = inject(CustomerService);

  protected readonly tabs: { key: CustomerTab; label: string }[] = [
    { key: 'all', label: 'Everyone' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'unverified', label: 'Unverified' },
  ];

  protected readonly search = signal('');
  protected readonly tab = signal<CustomerTab>('all');
  protected readonly showForm = signal(false);
  protected readonly editing = signal<CustomerResponse | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.tab();
    return this.service
      .items()
      .filter(
        (c) =>
          (!q || [this.fullName(c), c.email, c.phone].some((v) => v.toLowerCase().includes(q))) &&
          this.matches(c, t),
      );
  });

  protected fullName(c: CustomerResponse): string {
    return `${c.firstName} ${c.lastName}`.trim();
  }

  protected initials(c: CustomerResponse): string {
    return ((c.firstName[0] ?? '') + (c.lastName[0] ?? '')).toUpperCase();
  }

  protected tabCount(t: CustomerTab): number {
    return this.service.items().filter((c) => this.matches(c, t)).length;
  }

  private matches(c: CustomerResponse, t: CustomerTab): boolean {
    switch (t) {
      case 'active':
        return c.isActive;
      case 'inactive':
        return !c.isActive;
      case 'unverified':
        return !c.isVerified;
      default:
        return true;
    }
  }

  protected openEdit(c: CustomerResponse): void {
    this.editing.set(c);
    this.showForm.set(true);
  }

  protected save(v: CustomerUpdateRequest): void {
    const current = this.editing();
    if (current) this.service.update(current.id, v);
    this.showForm.set(false);
  }

  protected toggleActive(c: CustomerResponse): void {
    this.service.setActive(c.id, !c.isActive);
  }
}
