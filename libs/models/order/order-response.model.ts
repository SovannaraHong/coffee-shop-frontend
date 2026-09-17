import { OrderDetailResponse } from './order-detail-response.model';
import { OrderStatus } from './order-status.enum';

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  status: OrderStatus;

  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;

  note?: string | null;
  orderDate: string;

  details: OrderDetailResponse[];
}
