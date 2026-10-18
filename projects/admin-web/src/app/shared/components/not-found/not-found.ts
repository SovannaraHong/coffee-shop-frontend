import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Logo],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-white p-6">
      <div class="w-full max-w-md text-center">
        <a routerLink="/dashboard" class="mb-8 inline-block"><app-logo /></a>
        <h1 class="text-8xl font-bold text-primary">404</h1>
        <h2 class="mt-2 text-xl font-semibold text-neutral-900">Page not found</h2>
        <p class="mb-6 mt-2 text-sm text-neutral-500">Sorry, the page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/dashboard" class="btn btn-primary"><i class="fa-solid fa-house"></i> Back to dashboard</a>
      </div>
    </div>
  `,
})
export class NotFound {}
