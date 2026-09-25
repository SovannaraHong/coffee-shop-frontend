export interface PaymentResponse {
  id: number;
  orderId: number;
  method: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | string;
  amount: number;
  transactionRef: string;
  paidAt: string | null;
}

export interface KhqrPaymentResult {
  payment: PaymentResponse;
  checkoutUrl: string;
  qrString: string;
}
