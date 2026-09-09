import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [{ path: '', component: Home }],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/components/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./features/auth/components/verify-otp/verify-otp').then((m) => m.VerifyOtp),
  },
];
