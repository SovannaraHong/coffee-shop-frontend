export interface NavChild {
  label: string;
  /** Font Awesome class, e.g. 'fa-cube' (rendered as `fa-solid ${icon}`) */
  icon: string;
  route: string;
  /** Same keys your AuthService.hasPermission() expects. Not enforced yet. */
  permission?: string;
}

export interface NavItem {
  label: string;
  icon: string;
  /** Leaf item: links straight to a route */
  route?: string;
  /** Group item: expands to show these children */
  children?: NavChild[];
  permission?: string;
}

/** Each section is separated from the next by a divider line. */
export type NavSection = NavItem[];

export const NAV_SECTIONS: NavSection[] = [
  [
    {
      label: 'Dashboard',
      icon: 'fa-table-cells-large',
      route: '/dashboard',
      permission: 'DASHBOARD_READ',
    },
  ],
  [
    {
      label: 'Inventory Management',
      icon: 'fa-cube',
      children: [
        { label: 'Products', icon: 'fa-cube', route: '/products', permission: 'PRODUCT_READ' },
        { label: 'Categories', icon: 'fa-tags', route: '/categories', permission: 'CATEGORY_READ' },
        { label: 'Recipe', icon: 'fa-tags', route: '/recipe', permission: 'CATEGORY_READ' },
        { label: 'Variant', icon: 'fa-truck-ramp-box', route: '/variant' },
        { label: 'Suppliers', icon: 'fa-truck', route: '/suppliers', permission: 'SUPPLIER_READ' },
        { label: 'Ingredients', icon: 'fa-wheat-awn', route: '/ingredients' },
        { label: 'Inventory transactions', icon: 'fa-right-left', route: '/inventory-transaction' },
        { label: 'Add-ons', icon: 'fa-mug-saucer', route: '/addons' },
        { label: 'Stock adjustments', icon: 'fa-sliders', route: '/stock-adjustment' },
        { label: 'Purchase orders', icon: 'fa-truck-ramp-box', route: '/purchase-orders' },
      ],
    },
  ],
  [
    {
      label: 'Orders',
      icon: 'fa-cart-shopping',
      children: [
        {
          label: 'All orders',
          icon: 'fa-bag-shopping',
          route: '/orders',
          permission: 'ORDER_READ',
        },
        {
          label: 'Payments',
          icon: 'fa-credit-card',
          route: '/payments',
          permission: 'PAYMENT_READ',
        },
      ],
    },
    { label: 'Customers', icon: 'fa-user-group', route: '/customers' },
  ],
  [
    {
      label: 'Management',
      icon: 'fa-briefcase',
      children: [
        { label: 'Staff', icon: 'fa-users', route: '/staff', permission: 'STAFF_READ' },
        { label: 'Reports', icon: 'fa-chart-pie', route: '/reports', permission: 'REPORT_READ' },
      ],
    },
  ],
];
