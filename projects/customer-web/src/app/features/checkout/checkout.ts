import { OrderApiService } from './../../../../../../libs/api/order/order.service';
import {
  OrderCreateRequest,
  OrderDetailRequest,
} from './../../../../../../libs/models/order/order-request.model';
import { AddressService } from './../../../../../../libs/api/address/address.service';
import {
  AddressCreateRequest,
  AddressUpdateRequest,
} from './../../../../../../libs/models/address/address-request.model';
import { AddressResponse } from './../../../../../../libs/models/address/address-response.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { loadAuth } from '../../core/auth/auth-storage.util';
import { CartService } from '../../../../../../libs/services/cart/cart.service';
import { PaymentQrModal } from '../../shared/components/payment-qr-modal/payment-qr-modal';
import { KhqrPaymentResult } from '../../../../../../libs/models/payment/payment-response';
import { PaymentService } from '../../../../../../libs/api/payment/payment.service';
import { OrderSuccess } from '../../shared/components/order-success/order-success';

interface AuthenticatedCustomer {
  id: number;
}

function readCustomerId(): number | null {
  return loadAuth<AuthenticatedCustomer>()?.customer?.id ?? null;
}

@Component({
  imports: [CommonModule, FormsModule, PaymentQrModal, OrderSuccess],
  selector: 'app-checkout',
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit {
  customerId = readCustomerId();

  addresses = signal<AddressResponse[]>([]);
  selectedAddressId = signal<number | null>(null);
  loadingAddresses = signal(false);

  showSuccessPopup = signal(false);

  showNewAddressForm = signal(false);
  savingAddress = signal(false);
  editingAddressId = signal<number | null>(null);
  deletingAddressId = signal<number | null>(null);
  settingDefaultId = signal<number | null>(null);
  newAddress: AddressCreateRequest = this.emptyAddress();

  note = signal('');
  placingOrder = signal(false);
  errorMessage = signal<string | null>(null);

  showPaymentModal = signal(false);
  paymentData = signal<KhqrPaymentResult | null>(null);
  pendingOrderId = signal<number | null>(null);

  canPlaceOrder = computed(
    () =>
      !!this.customerId &&
      this.cart.cartItems().length > 0 &&
      this.selectedAddressId() !== null &&
      !this.placingOrder(),
  );

  constructor(
    public cart: CartService,
    private addressService: AddressService,
    private orders: OrderApiService,
    private paymentApi: PaymentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.customerId) {
      this.errorMessage.set('Please sign in to check out.');
      return;
    }
    if (this.cart.cartItems().length === 0) {
      this.router.navigateByUrl('/');
      return;
    }
    this.loadAddresses();
  }

  private emptyAddress(): AddressCreateRequest {
    return {
      customerId: this.customerId ?? 0,
      label: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false,
    };
  }

  loadAddresses(): void {
    if (!this.customerId) return;
    this.loadingAddresses.set(true);
    this.addressService.getByCustomer(this.customerId).subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        const def = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (def) this.selectedAddressId.set(def.id);
        else this.showNewAddressForm.set(true);
        this.loadingAddresses.set(false);
      },
      error: () => {
        this.loadingAddresses.set(false);
        this.errorMessage.set('Could not load your addresses. Please try again.');
      },
    });
  }

  selectAddress(id: number): void {
    this.selectedAddressId.set(id);
    this.showNewAddressForm.set(false);
  }

  toggleNewAddressForm(): void {
    this.editingAddressId.set(null);
    this.newAddress = this.emptyAddress();
    this.showNewAddressForm.update((v) => !v);
  }

  cancelAddressForm(): void {
    this.editingAddressId.set(null);
    this.newAddress = this.emptyAddress();
    this.showNewAddressForm.set(false);
  }

  editAddress(address: AddressResponse): void {
    this.newAddress = {
      customerId: this.customerId ?? 0,
      label: address.label ?? '',
      addressLine: address.addressLine,
      city: address.city ?? '',
      state: address.state ?? '',
      postalCode: address.postalCode ?? '',
      country: address.country ?? '',
      isDefault: address.isDefault,
    };
    this.editingAddressId.set(address.id);
    this.showNewAddressForm.set(true);
  }

  saveNewAddress(): void {
    if (!this.customerId) return;
    if (!this.newAddress.addressLine.trim()) {
      this.errorMessage.set('Address line is required.');
      return;
    }

    this.savingAddress.set(true);
    this.errorMessage.set(null);

    const editingId = this.editingAddressId();

    if (editingId !== null) {
      // AddressUpdateRequest carries no customerId — the id in the URL scopes it.
      const request: AddressUpdateRequest = {
        label: this.newAddress.label,
        addressLine: this.newAddress.addressLine,
        city: this.newAddress.city,
        state: this.newAddress.state,
        postalCode: this.newAddress.postalCode,
        country: this.newAddress.country,
        isDefault: this.newAddress.isDefault,
      };

      this.addressService.update(editingId, request).subscribe({
        next: (updated) => {
          this.addresses.update((list) =>
            list.map((a) =>
              a.id === editingId ? updated : updated.isDefault ? { ...a, isDefault: false } : a,
            ),
          );
          this.selectedAddressId.set(updated.id);
          this.editingAddressId.set(null);
          this.showNewAddressForm.set(false);
          this.savingAddress.set(false);
        },
        error: (err) => {
          this.savingAddress.set(false);
          console.error('Address update failed:', err.status, err.error, err.message);
          this.errorMessage.set(
            'Could not update this address. Please check the fields and try again.',
          );
        },
      });
      return;
    }

    this.addressService.create({ ...this.newAddress, customerId: this.customerId }).subscribe({
      next: (created) => {
        this.addresses.update((list) =>
          created.isDefault
            ? [...list.map((a) => ({ ...a, isDefault: false })), created]
            : [...list, created],
        );
        this.selectedAddressId.set(created.id);
        this.showNewAddressForm.set(false);
        this.savingAddress.set(false);
      },
      error: (err) => {
        this.savingAddress.set(false);
        console.error('Address create failed:', err.status, err.error, err.message);
        this.errorMessage.set(
          'Could not save this address. Please check the fields and try again.',
        );
      },
    });
  }

  deleteAddress(id: number): void {
    if (!confirm('Remove this address?')) return;

    this.deletingAddressId.set(id);
    this.errorMessage.set(null);

    this.addressService.delete(id).subscribe({
      next: () => {
        this.addresses.update((list) => list.filter((a) => a.id !== id));
        if (this.selectedAddressId() === id) {
          const remaining = this.addresses();
          this.selectedAddressId.set(remaining[0]?.id ?? null);
        }
        this.deletingAddressId.set(null);
      },
      error: (err) => {
        this.deletingAddressId.set(null);
        this.errorMessage.set(
          err.status === 409
            ? (err.error?.message ??
                'This address is used in an existing order and cannot be deleted.')
            : 'Could not delete this address. Please try again.',
        );
      },
    });
  }

  setDefault(address: AddressResponse): void {
    if (address.isDefault) return;

    this.settingDefaultId.set(address.id);
    this.errorMessage.set(null);

    const request: AddressUpdateRequest = {
      label: address.label ?? undefined,
      addressLine: address.addressLine,
      city: address.city ?? undefined,
      state: address.state ?? undefined,
      postalCode: address.postalCode ?? undefined,
      country: address.country ?? undefined,
      isDefault: true,
    };

    this.addressService.update(address.id, request).subscribe({
      next: (updated) => {
        this.addresses.update((list) =>
          list.map((a) => (a.id === updated.id ? updated : { ...a, isDefault: false })),
        );
        this.selectedAddressId.set(updated.id);
        this.settingDefaultId.set(null);
      },
      error: () => {
        this.settingDefaultId.set(null);
        this.errorMessage.set('Could not set this address as default. Please try again.');
      },
    });
  }

  placeOrder(): void {
    if (!this.canPlaceOrder() || !this.customerId) return;

    const details: OrderDetailRequest[] = this.cart.cartItems().map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      addons: item.addons.map((a) => ({ addonId: a.addonId, quantity: a.quantity })),
    }));

    const request: OrderCreateRequest = {
      customerId: this.customerId,
      addressId: this.selectedAddressId(),
      note: this.note().trim() || undefined,
      details,
    };

    this.placingOrder.set(true);
    this.errorMessage.set(null);

    this.orders.create(request).subscribe({
      next: (order) => {
        this.pendingOrderId.set(order.id);
        this.initiatePayment(order.id);
      },
      error: () => {
        this.placingOrder.set(false);
        this.errorMessage.set('Something went wrong placing your order. Please try again.');
      },
    });
  }

  private initiatePayment(orderId: number): void {
    this.paymentApi.initiateKhqrPayment(orderId).subscribe({
      next: (result) => {
        this.placingOrder.set(false);
        this.paymentData.set(result);
        this.showPaymentModal.set(true);
      },
      error: () => {
        this.placingOrder.set(false);
        this.errorMessage.set('Could not start payment. Please try again.');
      },
    });
  }

  onPaymentSuccess(): void {
    this.showPaymentModal.set(false);
    this.cart.cartItems.set([]);
    this.showSuccessPopup.set(true);
  }

  onSuccessClosed(): void {
    this.showSuccessPopup.set(false);
    this.pendingOrderId.set(null);
    this.paymentData.set(null);
  }

  onModalClosed(): void {
    this.showPaymentModal.set(false);
  }
  goBackToHome(): void {
    this.cart.close();
    this.router.navigate(['/']);
  }
}
