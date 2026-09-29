import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./features/product/pages/product-detail/product-detail').then(
            (m) => m.ProductDetail,
          ),
      },
      {
        path: 'front/menu-page',
        loadComponent: () =>
          import('./shared/components/banner-menu/banner-menu').then((m) => m.BannerMenu),
      },
      {
        path: 'front/about',
        loadComponent: () => import('./features/about-page/about-page').then((m) => m.AboutPage),
      },
      {
        canActivate: [authGuard],
        path: 'front/checkout',
        loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
      },
      {
        canActivate: [authGuard],
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/order/component/order-detail/order-detail').then((m) => m.OrderDetail),
      },
    ],
  },

  {
    path: 'front/login',
    loadComponent: () => import('./features/auth/components/login/login').then((m) => m.Login),
  },
  {
    path: 'front/signup',
    loadComponent: () => import('./features/auth/components/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'front/verify-otp',
    loadComponent: () =>
      import('./features/auth/components/verify-otp/verify-otp').then((m) => m.VerifyOtp),
  },
];
