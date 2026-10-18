import { Injectable } from '@angular/core';
import { Payment } from '../models/payment';
import { PAYMENTS } from '../data/mock-data';
import { InMemoryStore } from './in-memory-store';

@Injectable({ providedIn: 'root' })
export class PaymentService extends InMemoryStore<Payment> {
  constructor() {
    super(PAYMENTS);
  }
}
