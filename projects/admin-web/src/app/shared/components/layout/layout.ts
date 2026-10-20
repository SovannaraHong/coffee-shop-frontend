import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NAV_SECTIONS } from '../../../core/models/nav-items';
import { ClickOutside } from '../../directives/click-outside';
import { Logo } from '../logo/logo';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ClickOutside, Logo],
  templateUrl: './layout.html',
})
export class Layout {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly sections = NAV_SECTIONS;

  protected readonly collapsed = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly notifOpen = signal(false);
  protected readonly userOpen = signal(false);

  protected readonly openGroups = signal<string[]>(this.initialOpenGroups());

  // Get the logged-in user from AuthService.
  protected readonly user = computed(() => {
    const authUser = this.auth.user();

    return {
      name: authUser?.fullName?.trim() || authUser?.email || 'User',

      role: authUser?.roleName || 'Staff',

      avatar: authUser?.avatarUrl?.trim() || 'assets/images/avatar/avatar-1.jpg',
    };
  });

  protected logout(): void {
    this.auth.logout();
  }

  protected readonly notifications = [
    {
      icon: 'fa-bag-shopping',
      tone: 'bg-primary/10 text-primary',
      title: 'New order #1052',
      text: 'Charlotte Clark ordered 3 items',
      time: '5 min ago',
    },
    {
      icon: 'fa-triangle-exclamation',
      tone: 'bg-amber-100 text-amber-600',
      title: 'Low stock',
      text: 'Caramel Syrup is below reorder level',
      time: '30 min ago',
    },
    {
      icon: 'fa-circle-check',
      tone: 'bg-emerald-100 text-emerald-600',
      title: 'Payment received',
      text: '$12.40 paid by card for #1045',
      time: '1 hour ago',
    },
  ];

  protected readonly sidebarClass = computed(
    () =>
      (this.collapsed() ? 'w-64 lg:w-[68px] ' : 'w-64 ') +
      (this.mobileOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'),
  );

  protected readonly topbarClass = computed(() =>
    this.collapsed() ? 'lg:left-[68px]' : 'lg:left-64',
  );

  protected readonly contentClass = computed(() =>
    this.collapsed() ? 'lg:ml-[68px]' : 'lg:ml-64',
  );

  protected readonly hideWhenCollapsed = computed(() => (this.collapsed() ? 'lg:hidden' : ''));

  protected readonly linkClass = computed(() =>
    this.collapsed() ? 'lg:justify-center lg:px-0' : '',
  );

  protected isOpen(label: string): boolean {
    return this.openGroups().includes(label);
  }

  protected toggleGroup(label: string): void {
    if (this.collapsed()) {
      this.collapsed.set(false);

      if (!this.isOpen(label)) {
        this.openGroups.update((groups) => [...groups, label]);
      }

      return;
    }

    this.openGroups.update((groups) =>
      groups.includes(label) ? groups.filter((item) => item !== label) : [...groups, label],
    );
  }

  private initialOpenGroups(): string[] {
    const url = this.router.url;

    return NAV_SECTIONS.flat()
      .filter((item) => item.children?.some((child) => url.startsWith(child.route)))
      .map((item) => item.label);
  }
}
