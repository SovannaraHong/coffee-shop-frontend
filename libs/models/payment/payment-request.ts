export interface KhqrPaymentResult {
  payment: {
    id: number;
    orderId: number;
    method: string;
    status: string;
    amount: number;
    transactionRef: string;
    paidAt: string | null;
  };
  checkoutUrl: string;
  qrString: string;
}
