import { Injectable, signal, computed } from '@angular/core';
import { loadAuth, saveAuth, clearAuth, StoreAuth } from './auth-storage.util';
import { CustomerResponse } from '../../../../../../libs/models/customer/customer-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Initialize from localStorage on app start
  private readonly authState = signal<StoreAuth<CustomerResponse> | null>(
    loadAuth<CustomerResponse>(),
  );

  customer = computed(() => this.authState()?.customer ?? null);
  customerId = computed(() => this.authState()?.customer?.id ?? undefined);
  isLoggedIn = computed(() => this.authState() != null);

  login(auth: StoreAuth<CustomerResponse>) {
    saveAuth(auth);
    this.authState.set(auth); // <-- triggers reactivity everywhere
  }

  logout() {
    clearAuth();
    this.authState.set(null);
  }
}
