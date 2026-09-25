import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-order-success',
  styleUrl: './order-success.css',
  templateUrl: './order-success.html',
})
export class OrderSuccess implements OnInit, OnDestroy {
  @Input() orderNumber?: string;
  @Input() amount?: number;
  @Output() closed = new EventEmitter<void>();

  phase = signal<'loading' | 'success'>('loading');

  private toSuccessTimeout?: ReturnType<typeof setTimeout>;
  private autoCloseTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // brief "confirming" beat before the checkmark plays
    this.toSuccessTimeout = setTimeout(() => {
      this.phase.set('success');
      this.autoCloseTimeout = setTimeout(() => this.close(), 2600);
    }, 700);
  }

  ngOnDestroy(): void {
    clearTimeout(this.toSuccessTimeout);
    clearTimeout(this.autoCloseTimeout);
  }

  close(): void {
    this.closed.emit();
  }
}
