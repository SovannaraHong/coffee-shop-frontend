export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery';
export type PaymentMethod = 'Cash' | 'Card' | 'QR Pay';
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded' | 'Failed';

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export interface OrderItem {
  productId: number;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  number: string;
  customer: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  table?: string;
  staffId: number;
}
