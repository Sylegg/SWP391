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
