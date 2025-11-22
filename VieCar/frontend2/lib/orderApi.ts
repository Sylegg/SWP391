import { API_BASE_URL } from './config';

export interface OrderRes {
  orderId: number;
  dealerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  productName: string;
  productImage?: string;
  productVin?: string;
  productEngine?: string;
  productBattery?: number;
  productRange?: number;
  productHP?: number;
  productTorque?: number;
  productColor?: string;
  contracts: any[];
  totalPrice: number;
  status: string;
  orderDate?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface OrderReq {
  userId: number;
  dealerId: number;
  productId: number;
  quantity?: number;
  notes?: string;
}

export interface UpdateOrderReq {
  status?: string;
  notes?: string;
  deliveryDate?: string; // ISO date string YYYY-MM-DD
}

// Get all orders
export async function getAllOrders(): Promise<OrderRes[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders/listOrders`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

// Get orders by dealer ID
export async function getOrdersByDealerId(dealerId: number): Promise<OrderRes[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders/search/dealer/${dealerId}`);
  if (!response.ok) throw new Error('Failed to fetch orders by dealer');
  return response.json();
}

// Get orders by user ID
export async function getOrdersByUserId(userId: number): Promise<OrderRes[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders/search/user/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch orders by user');
  return response.json();
}

// Get order by ID
export async function getOrderById(id: number): Promise<OrderRes> {
  const response = await fetch(`${API_BASE_URL}/api/orders/search/id/${id}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
}

// Create order
export async function createOrder(data: OrderReq): Promise<OrderRes> {
  console.log('🚀 Sending order data to backend:', data);
  const response = await fetch(`${API_BASE_URL}/api/orders/createOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  console.log('📡 Response status:', response.status);
  
  if (!response.ok) {
    let errorText = 'Unknown error';
    try {
      const errorData = await response.json();
      errorText = JSON.stringify(errorData);
      console.error('❌ Error response JSON:', errorData);
    } catch {
      errorText = await response.text();
      console.error('❌ Error response text:', errorText);
    }
    throw new Error(`Failed to create order: ${errorText}`);
  }
  
  const result = await response.json();
  console.log('✅ Order created successfully:', result);
  return result;
}

// Update order
export async function updateOrder(id: number, data: UpdateOrderReq): Promise<OrderRes> {
  const response = await fetch(`${API_BASE_URL}/api/orders/updateOrder/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update order');
  return response.json();
}

// Delete order
export async function deleteOrder(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/orders/deleteOrder/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete order');
}

// Approve order (Dealer Staff duyệt đơn và yêu cầu đặt cọc)
export async function approveOrder(id: number, notes?: string): Promise<OrderRes> {
  const response = await fetch(`${API_BASE_URL}/api/orders/updateOrder/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      status: 'Chưa đặt cọc',
      notes: notes || 'Đơn hàng đã được duyệt. Vui lòng đặt cọc 30% để tiếp tục.'
    }),
  });
  if (!response.ok) throw new Error('Failed to approve order');
  return response.json();
}

// Reject order (Dealer Staff từ chối đơn)
export async function rejectOrder(id: number, reason: string): Promise<OrderRes> {
  const response = await fetch(`${API_BASE_URL}/api/orders/updateOrder/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      status: 'Đã từ chối',
      notes: reason
    }),
  });
  if (!response.ok) throw new Error('Failed to reject order');
  return response.json();
}

// Confirm deposit and request vehicle from dealer (Xác nhận đặt cọc và gửi yêu cầu đến đại lý)
export async function confirmDepositAndRequestVehicle(id: number, notes?: string): Promise<OrderRes> {
  const response = await fetch(`${API_BASE_URL}/api/orders/updateOrder/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      status: 'Đã yêu cầu đại lý',
      notes: notes || 'Đã xác nhận đặt cọc. Yêu cầu đã được gửi đến đại lý để chuẩn bị xe.'
    }),
  });
  if (!response.ok) throw new Error('Failed to confirm deposit and request vehicle');
  return response.json();
}

// Confirm vehicle ready (Xác nhận xe đã sẵn sàng, yêu cầu khách hàng đến nhận và thanh toán)
export async function confirmVehicleReady(id: number, deliveryDate?: string, notes?: string): Promise<OrderRes> {
  const response = await fetch(`${API_BASE_URL}/api/orders/updateOrder/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      status: 'Sẵn sàng giao xe',
      deliveryDate: deliveryDate, // Send as YYYY-MM-DD string
      notes: notes || 'Xe đã được chuẩn bị xong. Vui lòng đến đại lý để nhận xe và thanh toán 70% còn lại.'
    }),
  });
  if (!response.ok) throw new Error('Failed to confirm vehicle ready');
  return response.json();
}

// Confirm customer picked up vehicle (Xác nhận khách hàng đã lấy xe và thanh toán)
export async function confirmVehiclePickedUp(id: number, notes?: string): Promise<OrderRes> {
  const response = await fetch(`${API_BASE_URL}/api/orders/updateOrder/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      status: 'Đã giao',
      notes: notes || 'Khách hàng đã nhận xe và hoàn tất thanh toán 70% còn lại.'
    }),
  });
  if (!response.ok) throw new Error('Failed to confirm vehicle picked up');
  return response.json();
}
