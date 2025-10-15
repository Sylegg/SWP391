// Fake Payment Service API
export interface PaymentMethod {
  id: string;
  type: 'credit-card' | 'bank-transfer' | 'e-wallet' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
  logo?: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchName?: string;
  transactionRef?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  orderName: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  date: string;
  description?: string;
  receiptUrl?: string;
  bankDetails?: BankDetails;
  orderItems?: OrderItem[];
  fee?: number;
  discount?: number;
  finalAmount?: number;
}

export interface InstallmentPlan {
  id: string;
  orderId: string;
  orderName: string;
  totalAmount: number;
  monthlyPayment: number;
  duration: number; // months
  currentPeriod: number;
  nextPaymentDate: string;
  status: 'active' | 'completed' | 'overdue';
  payments: InstallmentPayment[];
}

export interface InstallmentPayment {
  period: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
}

// Fake data
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'credit-card',
    name: 'Visa **** 4242',
    details: 'Hết hạn 12/2026',
    isDefault: true,
    logo: '💳'
  },
  {
    id: 'pm2',
    type: 'bank-transfer',
    name: 'Techcombank',
    details: '1234567890',
    isDefault: false,
    logo: '🏦'
  },
  {
    id: 'pm3',
    type: 'e-wallet',
    name: 'MoMo',
    details: '0912345678',
    isDefault: false,
    logo: '📱'
  },
  {
    id: 'pm4',
    type: 'e-wallet',
    name: 'ZaloPay',
    details: '0912345678',
    isDefault: false,
    logo: '💰'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    orderId: 'VF2025001',
    orderName: 'VinFast VF8 Plus',
    amount: 300000000,
    paymentMethod: 'Visa **** 4242',
    status: 'completed',
    date: '2025-09-05T10:30:00',
    description: 'Thanh toán đợt 1',
    receiptUrl: '#',
    bankDetails: {
      bankName: 'ACB Bank',
      accountNumber: '123456789',
      accountHolder: 'VINFAST CORPORATION',
      branchName: 'Chi nhánh Hà Nội',
      transactionRef: 'ACB20250905103045'
    },
    orderItems: [
      {
        productName: 'VinFast VF8 Plus - Màu Đỏ',
        quantity: 1,
        unitPrice: 1200000000,
        totalPrice: 1200000000
      }
    ],
    fee: 0,
    discount: 0,
    finalAmount: 300000000
  },
  {
    id: 'TXN002',
    orderId: 'VF2025001',
    orderName: 'VinFast VF8 Plus',
    amount: 50000000,
    paymentMethod: 'Techcombank',
    status: 'completed',
    date: '2025-08-15T14:20:00',
    description: 'Đặt cọc',
    receiptUrl: '#',
    bankDetails: {
      bankName: 'Techcombank',
      accountNumber: '19036868189018',
      accountHolder: 'CONG TY VINFAST',
      branchName: 'PGD Cầu Giấy',
      transactionRef: 'TCB20250815142035'
    },
    orderItems: [
      {
        productName: 'VinFast VF8 Plus - Đặt cọc',
        quantity: 1,
        unitPrice: 50000000,
        totalPrice: 50000000
      }
    ],
    fee: 0,
    discount: 0,
    finalAmount: 50000000
  },
  {
    id: 'TXN003',
    orderId: 'VF2024089',
    orderName: 'VinFast VF5',
    amount: 20000000,
    paymentMethod: 'MoMo',
    status: 'refunded',
    date: '2025-07-10T09:15:00',
    description: 'Hoàn tiền đặt cọc',
    receiptUrl: '#',
    bankDetails: {
      bankName: 'MoMo E-Wallet',
      accountNumber: '0912345678',
      accountHolder: 'NGUYEN VAN A',
      transactionRef: 'MOMO20250710091520'
    },
    orderItems: [
      {
        productName: 'VinFast VF5 - Đặt cọc',
        quantity: 1,
        unitPrice: 20000000,
        totalPrice: 20000000
      }
    ],
    fee: 0,
    discount: 0,
    finalAmount: 20000000
  }
];

const mockInstallmentPlans: InstallmentPlan[] = [
  {
    id: 'IP001',
    orderId: 'VF2025001',
    orderName: 'VinFast VF8 Plus',
    totalAmount: 850000000,
    monthlyPayment: 70833333,
    duration: 12,
    currentPeriod: 1,
    nextPaymentDate: '2025-11-05',
    status: 'active',
    payments: Array.from({ length: 12 }, (_, i) => ({
      period: i + 1,
      amount: 70833333,
      dueDate: new Date(2025, 9 + i, 5).toISOString(),
      paidDate: i === 0 ? '2025-10-05T10:00:00' : undefined,
      status: i === 0 ? 'paid' : i === 1 ? 'pending' : 'pending'
    }))
  }
];

// API functions
export const paymentService = {
  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockPaymentMethods];
  },

  addPaymentMethod: async (method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newMethod = {
      ...method,
      id: `pm${Date.now()}`
    };
    mockPaymentMethods.push(newMethod);
    return newMethod;
  },

  deletePaymentMethod: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockPaymentMethods.findIndex(pm => pm.id === id);
    if (index > -1) {
      mockPaymentMethods.splice(index, 1);
      return true;
    }
    return false;
  },

  setDefaultPaymentMethod: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockPaymentMethods.forEach(pm => {
      pm.isDefault = pm.id === id;
    });
    return true;
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...mockTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  getTransactionById: async (id: string): Promise<Transaction | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTransactions.find(t => t.id === id) || null;
  },

  createPayment: async (data: {
    orderId: string;
    amount: number;
    paymentMethodId: string;
    description?: string;
  }): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
    
    const paymentMethod = mockPaymentMethods.find(pm => pm.id === data.paymentMethodId);
    
    // Simulate 10% chance of failure
    const isSuccess = Math.random() > 0.1;
    
    // Generate bank details based on payment method type
    let bankDetails: BankDetails | undefined;
    if (paymentMethod) {
      if (paymentMethod.type === 'bank-transfer') {
        bankDetails = {
          bankName: paymentMethod.name,
          accountNumber: '19036868189018',
          accountHolder: 'CONG TY VINFAST',
          branchName: 'PGD Cầu Giấy',
          transactionRef: `${paymentMethod.name.substring(0, 3).toUpperCase()}${Date.now()}`
        };
      } else if (paymentMethod.type === 'e-wallet') {
        bankDetails = {
          bankName: paymentMethod.name,
          accountNumber: paymentMethod.details,
          accountHolder: 'NGUYEN VAN A',
          transactionRef: `${paymentMethod.name.toUpperCase()}${Date.now()}`
        };
      } else if (paymentMethod.type === 'credit-card') {
        bankDetails = {
          bankName: 'ACB Bank',
          accountNumber: paymentMethod.name.split('*')[1]?.trim() || '****',
          accountHolder: 'VINFAST CORPORATION',
          branchName: 'Chi nhánh Hà Nội',
          transactionRef: `ACB${Date.now()}`
        };
      }
    }

    // Calculate fee (2.5% for credit card, 1.5% for e-wallet, 0% for bank transfer)
    let fee = 0;
    if (paymentMethod?.type === 'credit-card') {
      fee = Math.round(data.amount * 0.025);
    } else if (paymentMethod?.type === 'e-wallet') {
      fee = Math.round(data.amount * 0.015);
    }
    
    const transaction: Transaction = {
      id: `TXN${String(mockTransactions.length + 1).padStart(3, '0')}`,
      orderId: data.orderId,
      orderName: 'VinFast VF8 Plus',
      amount: data.amount,
      paymentMethod: paymentMethod?.name || 'Unknown',
      status: isSuccess ? 'completed' : 'failed',
      date: new Date().toISOString(),
      description: data.description,
      receiptUrl: isSuccess ? '#receipt' : undefined,
      bankDetails: isSuccess ? bankDetails : undefined,
      orderItems: [
        {
          productName: 'VinFast VF8 Plus - Màu Đỏ',
          quantity: 1,
          unitPrice: 1200000000,
          totalPrice: 1200000000
        }
      ],
      fee,
      discount: 0,
      finalAmount: data.amount + fee
    };
    
    if (isSuccess) {
      mockTransactions.unshift(transaction);
    }
    
    return transaction;
  },

  // Installment Plans
  getInstallmentPlans: async (): Promise<InstallmentPlan[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...mockInstallmentPlans];
  },

  createInstallmentPlan: async (data: {
    orderId: string;
    orderName: string;
    totalAmount: number;
    duration: number; // months
    downPayment: number;
  }): Promise<InstallmentPlan> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const remainingAmount = data.totalAmount - data.downPayment;
    const monthlyPayment = Math.round(remainingAmount / data.duration);
    
    const plan: InstallmentPlan = {
      id: `IP${String(mockInstallmentPlans.length + 1).padStart(3, '0')}`,
      orderId: data.orderId,
      orderName: data.orderName,
      totalAmount: remainingAmount,
      monthlyPayment,
      duration: data.duration,
      currentPeriod: 1,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      payments: Array.from({ length: data.duration }, (_, i) => ({
        period: i + 1,
        amount: monthlyPayment,
        dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending' as const
      }))
    };
    
    mockInstallmentPlans.push(plan);
    return plan;
  },

  payInstallment: async (planId: string, period: number, paymentMethodId: string): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const plan = mockInstallmentPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    
    const payment = plan.payments.find(p => p.period === period);
    if (!payment) throw new Error('Payment not found');
    
    const paymentMethod = mockPaymentMethods.find(pm => pm.id === paymentMethodId);
    
    // Simulate payment
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      payment.status = 'paid';
      payment.paidDate = new Date().toISOString();
      plan.currentPeriod = period + 1;
      
      if (period < plan.duration) {
        plan.nextPaymentDate = plan.payments[period].dueDate;
      } else {
        plan.status = 'completed';
      }
    }
    
    const transaction: Transaction = {
      id: `TXN${String(mockTransactions.length + 1).padStart(3, '0')}`,
      orderId: plan.orderId,
      orderName: plan.orderName,
      amount: payment.amount,
      paymentMethod: paymentMethod?.name || 'Unknown',
      status: isSuccess ? 'completed' : 'failed',
      date: new Date().toISOString(),
      description: `Thanh toán kỳ ${period}/${plan.duration}`,
      receiptUrl: isSuccess ? '#receipt' : undefined
    };
    
    if (isSuccess) {
      mockTransactions.unshift(transaction);
    }
    
    return transaction;
  },

  // Download receipt
  downloadReceipt: async (transactionId: string): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simulate PDF download
    const content = `BIÊN LAI THANH TOÁN\n\nMã giao dịch: ${transactionId}\nNgày: ${new Date().toLocaleString('vi-VN')}`;
    return new Blob([content], { type: 'text/plain' });
  }
};
