// Order Service - Mock implementation for customer dashboard

export interface Order {
  id: string;
  orderNumber: string;
  vehicleModel: string;
  vehicleConfig: {
    color: string;
    interior: string;
    battery: string;
    wheels: string;
    autopilot: boolean;
  };
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'quote-request' | 'quote-sent' | 'deposit-pending' | 'deposit-paid' | 'in-production' | 'ready-for-delivery' | 'delivering' | 'completed' | 'cancelled';
  dealerName: string;
  dealerAddress: string;
  dealerContact: string;
  deliveryAddress?: string;
  createdDate: string;
  notes?: string;
  timeline: {
    id: string;
    title: string;
    description: string;
    date?: string;
    isCompleted: boolean;
    isCurrent: boolean;
  }[];
}

export interface DeliveryTracking {
  orderId: string;
  status: 'preparing' | 'in-transit' | 'arrived' | 'delivered';
  currentLocation: string;
  estimatedArrival: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  trackingHistory: {
    location: string;
    status: string;
    note?: string;
    timestamp: string | Date;
  }[];
}

// Mock data
const mockOrders: Order[] = [
  {
    id: 'ORD001',
    orderNumber: 'VF2025001',
    vehicleModel: 'VinFast VF8 Plus',
    vehicleConfig: {
      color: 'Xanh Ocean',
      interior: 'Da nâu cao cấp',
      battery: '87.7 kWh',
      wheels: 'Mâm 20 inch',
      autopilot: true
    },
    totalAmount: 1200000000,
    paidAmount: 300000000,
    remainingAmount: 900000000,
    status: 'in-production',
    dealerName: 'Đại lý VinFast Hà Nội',
    dealerAddress: '123 Đường Láng, Đống Đa, Hà Nội',
    dealerContact: '0912345678',
    deliveryAddress: '456 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    createdDate: new Date('2025-09-15').toISOString(),
    notes: 'Giao xe trước tết',
    timeline: [
      {
        id: 'TL1',
        title: 'Đặt cọc',
        description: 'Đã đặt cọc 300 triệu',
        date: new Date('2025-09-15').toISOString(),
        isCompleted: true,
        isCurrent: false
      },
      {
        id: 'TL2',
        title: 'Đang sản xuất',
        description: 'Xe đang được sản xuất tại nhà máy',
        date: new Date('2025-10-01').toISOString(),
        isCompleted: false,
        isCurrent: true
      },
      {
        id: 'TL3',
        title: 'Sẵn sàng giao',
        description: 'Xe đã hoàn thiện, chờ vận chuyển',
        isCompleted: false,
        isCurrent: false
      },
      {
        id: 'TL4',
        title: 'Giao xe',
        description: 'Hoàn tất giao xe cho khách hàng',
        isCompleted: false,
        isCurrent: false
      }
    ]
  }
];

const mockTracking: DeliveryTracking = {
  orderId: 'ORD001',
  status: 'in-transit',
  currentLocation: 'Hà Nam',
  estimatedArrival: new Date(Date.now() + 3600000 * 5).toISOString(),
  driverName: 'Nguyễn Văn A',
  driverPhone: '0987654321',
  vehicleNumber: '29A-12345',
  trackingHistory: [
    {
      location: 'Hải Phòng - Khởi hành từ cảng',
      status: 'Đã nhận xe',
      timestamp: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      location: 'Hải Dương',
      status: 'Đang di chuyển',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      location: 'Hà Nam',
      status: 'Đang di chuyển',
      note: 'Dự kiến đến Hà Nội trong 5h',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]
};

export const orderService = {
  async getOrders(): Promise<Order[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders;
  },

  async getDeliveryTracking(orderId: string): Promise<DeliveryTracking> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTracking;
  },

  async createQuoteRequest(request: {
    vehicleModel: string;
    preferredColor: string;
    customerNotes: string;
  }): Promise<Order> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newOrder: Order = {
      id: `ORD${mockOrders.length + 1}`.padStart(6, '0'),
      orderNumber: `VF2025${mockOrders.length + 1}`.padStart(10, '0'),
      vehicleModel: `VinFast ${request.vehicleModel}`,
      vehicleConfig: {
        color: request.preferredColor || 'Chưa chọn',
        interior: 'Chưa chọn',
        battery: 'Chưa chọn',
        wheels: 'Chưa chọn',
        autopilot: false
      },
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      status: 'quote-request',
      dealerName: 'Đang phân công',
      dealerAddress: '',
      dealerContact: '',
      createdDate: new Date().toISOString(),
      notes: request.customerNotes,
      timeline: [
        {
          id: 'TL1',
          title: 'Yêu cầu báo giá',
          description: 'Đã gửi yêu cầu báo giá',
          date: new Date().toISOString(),
          isCompleted: true,
          isCurrent: false
        },
        {
          id: 'TL2',
          title: 'Chờ báo giá',
          description: 'Đại lý đang xử lý yêu cầu',
          isCompleted: false,
          isCurrent: true
        }
      ]
    };
    
    mockOrders.unshift(newOrder);
    return newOrder;
  },

  async cancelOrder(orderId: string, reason: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'cancelled';
      order.notes = `Hủy: ${reason}`;
    }
  },

  async updateDeliveryAddress(orderId: string, newAddress: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.deliveryAddress = newAddress;
    }
  },

  async contactDealer(orderId: string, message: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Message sent for order ${orderId}: ${message}`);
  },

  async downloadInvoice(orderId: string): Promise<Blob> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const content = `HÓA ĐƠN\n\nMã đơn hàng: ${orderId}\nNgày: ${new Date().toLocaleDateString('vi-VN')}\n\nThông tin đơn hàng...`;
    return new Blob([content], { type: 'text/plain' });
  },

  async downloadContract(orderId: string): Promise<Blob> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const content = `HỢP ĐỒNG MUA XE\n\nMã đơn hàng: ${orderId}\nNgày: ${new Date().toLocaleDateString('vi-VN')}\n\nĐiều khoản hợp đồng...`;
    return new Blob([content], { type: 'text/plain' });
  }
};
