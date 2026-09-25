import { CustomerResponse } from './../../../../../../libs/models/customer/customer-response.model';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { CartService } from '../../../../../../libs/services/cart/cart.service';
import { OrderService } from '../../../../../../libs/services/order/order.service';

interface NavLink {
  label: string;
  route: string;
}

interface UserMenuItem {
  label: string;
  icon: string;
  action: 'profile' | 'orders' | 'favorites';
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  cartService = inject(CartService);
  ordersService = inject(OrderService);

  navLinks: NavLink[] = [
    {
      label: 'Home',
      route: '/',
    },
    {
      label: 'Menu',
      route: 'front/menu-page',
    },
    {
      label: 'About Us',
      route: 'front/about',
    },
    {
      label: 'Locations',
      route: 'front/locations',
    },
    {
      label: 'Contact',
      route: 'front/contact',
    },
  ];
  categoryLinks = [
    { label: 'Popular', route: 'front/popular' },
    { label: 'Coffee', route: 'front/coffee' },
    { label: 'Rewards', route: 'front/rewards' },
    { label: 'Gift Card', route: 'front/gift-card' },
    { label: 'Promotion', route: 'front/promotion' },
  ];

  currentUser = signal<CustomerResponse | null>(null);

  userMenuItems: UserMenuItem[] = [
    {
      label: 'My Profile',
      icon: 'user',
      action: 'profile',
    },
    {
      label: 'My Orders',
      icon: 'shopping-bag',
      action: 'orders',
    },
    {
      label: 'Favorites',
      icon: 'heart',
      action: 'favorites',
    },
  ];

  isMenuOpen = signal(false);

  constructor(
    private readonly elementRef: ElementRef,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const raw =
      localStorage.getItem('customerResponse') ?? sessionStorage.getItem('customerResponse');

    if (!raw) {
      this.currentUser.set(null);
      return;
    }

    try {
      const customer: CustomerResponse = JSON.parse(raw);

      this.currentUser.set(customer);
    } catch (error) {
      console.error('Failed to parse customerResponse:', error);

      this.currentUser.set(null);
    }
  }

  get displayName(): string {
    const user = this.currentUser();

    if (!user) {
      return '';
    }

    return `${user.firstName} ${user.lastName}`;
  }

  get initial(): string {
    const user = this.currentUser();

    if (!user) {
      return '';
    }

    const firstInitial = user.firstName?.charAt(0).toUpperCase() ?? '';

    const lastInitial = user.lastName?.charAt(0).toUpperCase() ?? '';

    return firstInitial + lastInitial;
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onMenuAction(action: UserMenuItem['action']): void {
    this.closeMenu();

    switch (action) {
      case 'profile':
        this.router.navigate(['front/profile']);
        break;

      case 'orders':
        this.router.navigate(['front/orders']);
        break;

      case 'favorites':
        this.router.navigate(['front/favorites']);
        break;
    }
  }

  onSignOut(): void {
    this.closeMenu();

    // Don't access browser storage during SSR.
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('customerResponse');

      sessionStorage.removeItem('token');
      sessionStorage.removeItem('tokenType');
      sessionStorage.removeItem('customerResponse');
    }

    this.currentUser.set(null);

    this.router.navigate(['front/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = event.target as Node | null;

    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.closeMenu();
    }
  }
}
