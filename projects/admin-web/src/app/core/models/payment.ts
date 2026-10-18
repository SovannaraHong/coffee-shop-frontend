import { PaymentMethod, PaymentStatus } from './order';

export interface Payment {
  id: number;
  reference: string;
  orderNumber: string;
  customer: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string;
}
