// Distribution Types
// Luồng nghiệp vụ: EVM Staff mời → Dealer phản hồi → Tạo đơn → EVM duyệt → Giao hàng

import { ProductRes } from './product';

/**
 * Distribution Status Flow:
 * INVITED → ACCEPTED/DECLINED → PENDING → CONFIRMED/CANCELED → PLANNED → COMPLETED
 */
export enum DistributionStatus {
  INVITED = 'INVITED',       // EVM gửi lời mời
  ACCEPTED = 'ACCEPTED',     // Dealer chấp nhận
  DECLINED = 'DECLINED',     // Dealer từ chối
  PENDING = 'PENDING',       // Dealer đã tạo đơn chi tiết, chờ EVM duyệt
  CONFIRMED = 'CONFIRMED',   // EVM đã duyệt đơn
  CANCELED = 'CANCELED',     // EVM từ chối đơn
  PRICE_SENT = 'PRICE_SENT', // EVM gửi giá hãng, chờ dealer phản hồi
  PRICE_ACCEPTED = 'PRICE_ACCEPTED', // Dealer chấp nhận giá
  PRICE_REJECTED = 'PRICE_REJECTED', // Dealer từ chối giá
  PLANNED = 'PLANNED',       // EVM đã lên kế hoạch giao hàng
  COMPLETED = 'COMPLETED',   // Dealer xác nhận đã nhận hàng
}

/**
 * Distribution Invitation Request (Bước 1: EVM tạo lời mời)
 */
export interface DistributionInvitationReq {
  dealerId: number;
  message?: string;           // Thông điệp mời
  deadline?: string;          // Thời hạn phản hồi (ISO date)
}

/**
 * Distribution Order Request (Bước 3: Dealer tạo đơn chi tiết)
 */
export interface DistributionOrderReq {
  items: {
    // Cho phép tạo theo sản phẩm cụ thể HOẶC theo danh mục (không cần product)
    productId?: number;
    categoryId?: number;
    color?: string;
    quantity: number;
  }[];                         // Danh sách chi tiết: mỗi dòng gồm màu và số lượng
  dealerNotes?: string;        // Ghi chú của dealer
  requestedDeliveryDate?: string; // Ngày mong muốn nhận hàng
}

/**
 * Distribution Approval Request (Bước 4: EVM duyệt đơn)
 */
export interface DistributionApprovalReq {
  decision: string;           // "CONFIRMED" or "CANCELED"
  approvedQuantity?: number;  // Số lượng được duyệt
  evmNotes?: string;          // Ghi chú của EVM
}

/**
 * Distribution Planning Request (Bước 5: EVM lên kế hoạch)
 */
export interface DistributionPlanningReq {
  estimatedDeliveryDate: string;
  actualQuantity?: number;
  planningNotes?: string;
}

/**
 * Distribution Completion Request (Bước 6: Dealer xác nhận nhận hàng)
 */
export interface DistributionCompletionReq {
  actualDeliveryDate: string;
  receivedQuantity: number;
  feedback?: string;
  // Per-item breakdown to support auto product creation
  items?: {
    distributionItemId: number;
    receivedQuantity: number;
  }[];
}

/**
 * Distribution Response (Full object từ backend)
 */
export interface DistributionRes {
  id: number;
  status: DistributionStatus;
  
  // Dealer info
  dealerId: number;
  dealerName?: string;
  
  // ❌ Xóa categoryId - không dùng, Dealer đã có Category
  // categoryId: number;
  
  // Products
  products: ProductRes[];
  // Items (mới): chi tiết theo dòng xe / màu / số lượng
  items?: {
    id: number;
    product: ProductRes;
    color?: string;
    quantity: number;
  }[];
  
  // Timeline
  createdAt?: string;
  invitedAt?: string;
  
  // Messages & Notes
  invitationMessage?: string; // Lời mời từ EVM
  dealerNotes?: string;       // Ghi chú của Dealer
  evmNotes?: string;          // Ghi chú của EVM
  feedback?: string;          // Phản hồi sau khi nhận hàng
  
  // Dates
  deadline?: string;                  // Hạn phản hồi lời mời
  requestedDeliveryDate?: string;     // Ngày dealer mong muốn
  estimatedDeliveryDate?: string;     // Ngày EVM dự kiến giao
  actualDeliveryDate?: string;        // Ngày thực tế giao
  
  // Quantities
  requestedQuantity?: number;
  receivedQuantity?: number;
  
  // Manufacturer price (giá hãng)
  manufacturerPrice?: number;
}

/**
 * Distribution Statistics
 */
export interface DistributionStats {
  totalInvitations: number;
  pendingApproval: number;
  confirmed: number;
  completed: number;
  totalValue: number;
}

// Type aliases for convenience
export type Distribution = DistributionRes;
export type DistributionInvitation = DistributionInvitationReq;
export type DistributionOrder = DistributionOrderReq;
export type DistributionApproval = DistributionApprovalReq;
export type DistributionPlanning = DistributionPlanningReq;
export type DistributionCompletion = DistributionCompletionReq;

// Helper function to get status label
export const getDistributionStatusLabel = (status: DistributionStatus): string => {
  const labels: Record<DistributionStatus, string> = {
    [DistributionStatus.INVITED]: 'Đã gửi lời mời',
    [DistributionStatus.ACCEPTED]: 'Đã chấp nhận',
    [DistributionStatus.DECLINED]: 'Đã từ chối',
    [DistributionStatus.PENDING]: 'Chờ duyệt',
    [DistributionStatus.CONFIRMED]: 'Đã duyệt',
    [DistributionStatus.CANCELED]: 'Đã hủy',
    [DistributionStatus.PRICE_SENT]: 'Chờ xác nhận giá',
    [DistributionStatus.PRICE_ACCEPTED]: 'Đã chấp nhận giá',
    [DistributionStatus.PRICE_REJECTED]: 'Đã từ chối giá',
    [DistributionStatus.PLANNED]: 'Đã lên kế hoạch',
    [DistributionStatus.COMPLETED]: 'Hoàn thành',
  };
  return labels[status];
};

// Helper function to get status color
export const getDistributionStatusColor = (status: DistributionStatus): string => {
  const colors: Record<DistributionStatus, string> = {
    [DistributionStatus.INVITED]: 'bg-blue-100 text-blue-800',
    [DistributionStatus.ACCEPTED]: 'bg-green-100 text-green-800',
    [DistributionStatus.DECLINED]: 'bg-red-100 text-red-800',
    [DistributionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [DistributionStatus.CONFIRMED]: 'bg-green-100 text-green-800',
    [DistributionStatus.CANCELED]: 'bg-red-100 text-red-800',
    [DistributionStatus.PRICE_SENT]: 'bg-amber-100 text-amber-800',
    [DistributionStatus.PRICE_ACCEPTED]: 'bg-green-100 text-green-800',
    [DistributionStatus.PRICE_REJECTED]: 'bg-red-100 text-red-800',
    [DistributionStatus.PLANNED]: 'bg-purple-100 text-purple-800',
    [DistributionStatus.COMPLETED]: 'bg-green-100 text-green-800',
  };
  return colors[status];
};
