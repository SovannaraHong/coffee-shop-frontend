import { Routes } from '@angular/router';

export const routes: Routes = [
  // ---- Public pages (no sidebar) ----
  {
    path: 'login',
    title: 'Sign in · Brewly',
    loadComponent: () => import('./core/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Create account · Brewly',
    loadComponent: () => import('./core/auth/register/register').then((m) => m.Register),
  },

  // ---- Admin shell (sidebar + topbar) ----
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.Layout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · Brewly',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDER_ROUTES),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list/product-list').then((m) => m.ProductList),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customer/customer-list/customer-list').then((m) => m.CustomerList),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list/category-list').then((m) => m.CategoryList),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/inventory-list/inventory-list').then((m) => m.InventoryList),
      },
      {
        path: 'inventory-transaction',
        loadComponent: () =>
          import('./features/inventory-transaction/inventory-transaction-list/inventory-transaction-list').then(
            (m) => m.InventoryTransactionList,
          ),
      },
      {
        path: 'ingredients',
        loadComponent: () =>
          import('./features/ingredient/ingredient-list/ingredient-list').then(
            (m) => m.IngredientList,
          ),
      },
      {
        path: 'addons',
        loadComponent: () =>
          import('./features/addon/addon-list/addon-list').then((m) => m.AddonList),
      },
      {
        path: 'addons/:id/ingredients',
        loadComponent: () =>
          import('./features/addon-ingredient/addon-ingredient-list/addon-ingredient-list').then(
            (m) => m.AddonIngredientList,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payment-list/payment-list').then((m) => m.PaymentList),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./features/suppliers/supplier-list/supplier-list').then((m) => m.SupplierList),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/staff/staff-list/staff-list').then((m) => m.StaffList),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports').then((m) => m.Reports),
      },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then((m) => m.NotFound),
  },
];
