// Order API Types

// Order Status enum - theo workflow mới
export enum OrderStatus {
  DRAFT = 'DRAFT',               // Đang soạn, chưa gửi
  PENDING = 'PENDING',           // Đã gửi, chờ EVM duyệt
  APPROVED = 'APPROVED',         // EVM đã duyệt
  REJECTED = 'REJECTED',         // EVM từ chối
  DELIVERED = 'DELIVERED',       // Đã giao hàng (optional)
}

// Status labels
export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'Bản nháp',
  [OrderStatus.PENDING]: 'Chờ duyệt',
  [OrderStatus.APPROVED]: 'Đã duyệt',
  [OrderStatus.REJECTED]: 'Đã từ chối',
  [OrderStatus.DELIVERED]: 'Đã giao hàng',
};

// Status colors
export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [OrderStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [OrderStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [OrderStatus.DELIVERED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

// Order Item (1 sản phẩm trong order)
export interface OrderItem {
  id?: number;                   // OrderItem ID (có thể undefined khi tạo mới)
  orderId?: number;              // Order ID
  productId: number;             // ID sản phẩm
  productName?: string;          // Tên sản phẩm (từ backend)
  quantity: number;              // Số lượng
  price?: number;                // Giá (từ product)
  color?: string;                // Màu sắc
  notes?: string;                // Ghi chú cho item này
}

// Backend OrderRes (hiện tại - 1 order = 1 product)
export interface OrderRes {
  orderId: number;
  dealerId: number;
  customerName: string;
  productName: string;
  contracts: any[];
  totalPrice: number;
  status: string;
  orderDate?: Date | string;
  notes?: string;                // Dùng để lưu metadata (workaround)
}

// Backend OrderReq
export interface OrderReq {
  productId: number;
  quantity: number;
  notes?: string;
}

// Update Order Request
export interface UpdateOrderReq {
  status: string;
  notes?: string;
}

export interface DeliveryReq {
  address: string;
  deliveryDate: string;
  notes?: string;
}

// ============ FRONTEND MODELS (workaround) ============

// Order tổng hợp (nhiều items)
export interface Order {
  id: number;                    // Order ID (dùng orderId của item đầu tiên)
  dealerId: number;
  status: OrderStatus;
  items: OrderItem[];            // Danh sách items (nhiều products)
  totalPrice: number;            // Tổng tiền
  totalQuantity: number;         // Tổng số lượng
  notes?: string;                // Ghi chú chung cho order
  rejectionReason?: string;      // Lý do từ chối (nếu REJECTED)
  createdAt?: Date | string;
  submittedAt?: Date | string;   // Thời điểm gửi (DRAFT → PENDING)
  approvedAt?: Date | string;    // Thời điểm duyệt
  rejectedAt?: Date | string;    // Thời điểm từ chối
}

// Grouped order (group các OrderRes backend thành 1 Order frontend)
export interface GroupedOrder {
  orderDate: string;             // Dùng để group
  dealerId: number;
  status: OrderStatus;
  items: OrderRes[];             // Backend OrderRes[]
  totalPrice: number;
  totalProducts: number;
}
