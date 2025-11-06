import { API_BASE_URL } from './config';

export interface OrderRes {
  orderId: number;
  dealerId: number;
  customerName: string;
  productName: string;
  contracts: any[];
  totalPrice: number;
  status: string;
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
  const response = await fetch(`${API_BASE_URL}/api/orders/createOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create order');
  return response.json();
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
