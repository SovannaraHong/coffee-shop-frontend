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
  secondsLeft = 180;
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
        error: () => this.stopPolling(),
      });

    this.timerSub = interval(1000).subscribe(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
      } else if (this.status === 'PENDING') {
        this.status = 'EXPIRED';
        this.stopPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.timerSub?.unsubscribe();
  }

  formattedTime(): string {
    const m = Math.floor(this.secondsLeft / 60);
    const s = this.secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  close(): void {
    this.closed.emit();
  }
}
