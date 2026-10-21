import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guard/auth-guard';

export const routes: Routes = [
  // ---- Public pages (no sidebar) ----
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./core/auth/register/register').then((m) => m.Register),
  },

  // ---- Admin shell (sidebar + TopBar), requires login ----
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.Layout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
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
        path: 'recipe',
        loadComponent: () =>
          import('./features/recipe/recipe-list/recipe-list').then((m) => m.RecipeList),
      },

      // Old standalone page: it needs an add-on id, so send people to the add-ons list.
      { path: 'addon-ingredient', pathMatch: 'full', redirectTo: 'addons' },

      {
        path: 'inventory-transaction',
        loadComponent: () =>
          import('./features/inventory-transaction/inventory-transaction-list/inventory-transaction-list').then(
            (m) => m.InventoryTransactionList,
          ),
      },
      {
        path: 'stock-adjustment',
        loadComponent: () =>
          import('./features/stock-adjustment/stock-adjustment-list/stock-adjustment-list').then(
            (m) => m.StockAdjustmentList,
          ),
      },
      {
        path: 'purchase-orders',
        loadComponent: () =>
          import('./features/purchase-order/purchase-order-list/purchase-order-list').then(
            (m) => m.PurchaseOrderList,
          ),
      },
      {
        path: 'variant',
        loadComponent: () =>
          import('./features/variant/variant-list/variant-list').then((m) => m.VariantList),
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
          import('./features/supplier/supplier-list/supplier-list').then((m) => m.SupplierList),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/staff/staff-list/staff-list').then((m) => m.StaffList),
      },
      {
        path: 'role',
        loadComponent: () => import('./features/role/role-list/role-list').then((m) => m.RoleList),
      },
      {
        path: 'permission',
        loadComponent: () =>
          import('./features/permission/permission-list/permission-list').then(
            (m) => m.PermissionList,
          ),
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
