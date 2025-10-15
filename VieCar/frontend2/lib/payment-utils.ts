// Payment constants and configurations

export const PAYMENT_METHOD_TYPES = {
  CREDIT_CARD: 'credit-card',
  BANK_TRANSFER: 'bank-transfer',
  E_WALLET: 'e-wallet',
  CASH: 'cash'
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export const INSTALLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
} as const;

export const PAYMENT_METHOD_LABELS = {
  'credit-card': 'Thẻ tín dụng/ghi nợ',
  'bank-transfer': 'Chuyển khoản ngân hàng',
  'e-wallet': 'Ví điện tử',
  'cash': 'Tiền mặt'
};

export const POPULAR_BANKS = [
  { name: 'Techcombank', code: 'TCB' },
  { name: 'Vietcombank', code: 'VCB' },
  { name: 'VietinBank', code: 'CTG' },
  { name: 'BIDV', code: 'BIDV' },
  { name: 'MB Bank', code: 'MB' },
  { name: 'ACB', code: 'ACB' },
  { name: 'Sacombank', code: 'STB' },
  { name: 'VPBank', code: 'VPB' }
];

export const POPULAR_EWALLETS = [
  { name: 'MoMo', icon: '📱' },
  { name: 'ZaloPay', icon: '💰' },
  { name: 'VNPay', icon: '💳' },
  { name: 'ShopeePay', icon: '🛒' },
  { name: 'ViettelPay', icon: '📞' }
];

export const INSTALLMENT_DURATIONS = [
  { months: 6, label: '6 tháng' },
  { months: 12, label: '12 tháng' },
  { months: 18, label: '18 tháng' },
  { months: 24, label: '24 tháng' },
  { months: 36, label: '36 tháng' }
];

export const PAYMENT_LIMITS = {
  MIN_AMOUNT: 10000, // 10k VND
  MAX_AMOUNT: 10000000000, // 10B VND
  MIN_DOWN_PAYMENT_PERCENT: 20,
  MAX_INSTALLMENT_MONTHS: 36
};

// Currency formatting
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatShortVND = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B VND`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M VND`;
  }
  return formatVND(amount);
};

// Date formatting
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('vi-VN');
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('vi-VN');
};

// Calculate installment
export const calculateInstallment = (
  totalAmount: number,
  downPayment: number,
  months: number
): number => {
  const remainingAmount = totalAmount - downPayment;
  return Math.round(remainingAmount / months);
};

// Validate payment amount
export const validatePaymentAmount = (amount: number): { valid: boolean; error?: string } => {
  if (amount < PAYMENT_LIMITS.MIN_AMOUNT) {
    return { valid: false, error: `Số tiền tối thiểu là ${formatVND(PAYMENT_LIMITS.MIN_AMOUNT)}` };
  }
  if (amount > PAYMENT_LIMITS.MAX_AMOUNT) {
    return { valid: false, error: `Số tiền tối đa là ${formatVND(PAYMENT_LIMITS.MAX_AMOUNT)}` };
  }
  return { valid: true };
};

// Validate down payment
export const validateDownPayment = (
  downPayment: number,
  totalAmount: number
): { valid: boolean; error?: string } => {
  const minDownPayment = totalAmount * (PAYMENT_LIMITS.MIN_DOWN_PAYMENT_PERCENT / 100);
  if (downPayment < minDownPayment) {
    return { 
      valid: false, 
      error: `Đặt cọc tối thiểu ${PAYMENT_LIMITS.MIN_DOWN_PAYMENT_PERCENT}% (${formatVND(minDownPayment)})` 
    };
  }
  if (downPayment >= totalAmount) {
    return { valid: false, error: 'Đặt cọc phải nhỏ hơn tổng số tiền' };
  }
  return { valid: true };
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case TRANSACTION_STATUS.COMPLETED: return 'green';
    case TRANSACTION_STATUS.PENDING: return 'yellow';
    case TRANSACTION_STATUS.PROCESSING: return 'blue';
    case TRANSACTION_STATUS.FAILED: return 'red';
    case TRANSACTION_STATUS.REFUNDED: return 'gray';
    default: return 'gray';
  }
};

// Payment fee calculations (examples)
export const PAYMENT_FEES = {
  'credit-card': 2.5, // 2.5%
  'bank-transfer': 0, // Free
  'e-wallet': 1.5, // 1.5%
  'cash': 0 // Free
};

export const calculatePaymentFee = (amount: number, methodType: string): number => {
  const feePercent = PAYMENT_FEES[methodType as keyof typeof PAYMENT_FEES] || 0;
  return Math.round(amount * (feePercent / 100));
};

export const calculateTotalWithFee = (amount: number, methodType: string): number => {
  return amount + calculatePaymentFee(amount, methodType);
};
