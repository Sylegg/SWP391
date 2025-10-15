export type PaymentType = 'preorder' | 'order';

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'credit_card'
  | 'installment';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  dealerId: string;
  dealerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  paymentType?: PaymentType;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  customerId?: string;
  dealerId?: string;
  paymentType?: PaymentType;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentStatusPayload {
  status: PaymentStatus;
  notes?: string;
  approvedBy?: string;
}

export interface PaymentAnalyticsSnapshot {
  totalRevenue: number;
  totalTransactions: number;
  pendingPayments: number;
  completedPayments: number;
}

export interface PaymentListResponse {
  items: Payment[];
  total: number;
}
