import { PaymentService } from './../../../../../../../libs/api/payment/payment.service';

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-payment-qr-modal',
  standalone: true,
  imports: [QRCodeComponent],
  templateUrl: './payment-qr-modal.html',
  styleUrl: './payment-qr-modal.css',
})
export class PaymentQrModal implements OnInit, OnDestroy {
  @Input({ required: true }) paymentId!: number;
  @Input({ required: true }) qrString!: string;
  @Input({ required: true }) amount!: number;
  @Input() storeName = 'CoffeeShop App';

  @Output() closed = new EventEmitter<void>();
  @Output() paid = new EventEmitter<void>();

  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' = 'PENDING';

  // 5 minutes = 300 seconds
  secondsLeft = signal(5 * 60);

  isBrowser: boolean;

  private pollSub?: Subscription;
  private timerSub?: Subscription;

  constructor(
    private paymentApi: PaymentService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // COUNTDOWN: 5:00 -> 0:00
    this.timerSub = interval(1000).subscribe(() => {
      const next = this.secondsLeft() - 1;
      this.secondsLeft.set(Math.max(next, 0));

      if (next <= 0 && this.status === 'PENDING') {
        this.status = 'EXPIRED';
        this.stopPolling();
      }
    });

    // CHECK PAYMENT STATUS
    // Every 3 seconds
    this.pollSub = interval(3000)
      .pipe(switchMap(() => this.paymentApi.checkStatus(this.paymentId)))
      .subscribe({
        next: (payment) => {
          if (payment.status === 'PAID') {
            this.status = 'PAID';

            this.paid.emit();

            this.stopPolling();
          } else if (payment.status === 'FAILED') {
            this.status = 'FAILED';

            this.stopPolling();
          }
        },

        error: () => {
          this.stopPolling();
        },
      });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // STOP TIMER + PAYMENT POLLING
  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.timerSub?.unsubscribe();
  }

  // FORMAT COUNTDOWN
  // Example: 5:00, 4:59, 4:58...
  formattedTime(): string {
    const total = this.secondsLeft();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // CLOSE MODAL
  close(): void {
    this.closed.emit();
  }
}
