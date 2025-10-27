// Distribution API Service
// Handles all API calls for Distribution flow

import api from './api';
import {
  DistributionRes,
  DistributionInvitationReq,
  DistributionOrderReq,
  DistributionApprovalReq,
  DistributionPlanningReq,
  DistributionCompletionReq,
  DistributionStats,
} from '@/types/distribution';

const DISTRIBUTION_BASE = '/api/distributions';

// ============ EVM Staff APIs ============

/**
 * Step 1: EVM Staff gửi lời mời nhập hàng
 */
export const sendDistributionInvitation = async (
  data: DistributionInvitationReq
): Promise<DistributionRes> => {
  const response = await api.post<DistributionRes>(
    `${DISTRIBUTION_BASE}/invite`,
    data
  );
  return response.data;
};

/**
 * Get all distributions (EVM Staff view)
 */
export const getAllDistributions = async (): Promise<DistributionRes[]> => {
  const response = await api.get<DistributionRes[]>(
    `${DISTRIBUTION_BASE}/listDistributions`
  );
  return response.data;
};

/**
 * Get distributions by status
 */
export const getDistributionsByStatus = async (
  status: string
): Promise<DistributionRes[]> => {
  const response = await api.get<DistributionRes[]>(
    `${DISTRIBUTION_BASE}/search/status/${status}`
  );
  return response.data;
};

/**
 * Step 4: EVM Staff duyệt đơn nhập hàng (approve/reject)
 */
export const approveDistributionOrder = async (
  id: number,
  data: DistributionApprovalReq
): Promise<DistributionRes> => {
  const response = await api.put<DistributionRes>(
    `${DISTRIBUTION_BASE}/${id}/approve`,
    data
  );
  return response.data;
};

/**
 * Step 5: EVM Staff lên kế hoạch giao hàng
 */
export const planDistributionDelivery = async (
  id: number,
  data: DistributionPlanningReq
): Promise<DistributionRes> => {
  const response = await api.put<DistributionRes>(
    `${DISTRIBUTION_BASE}/${id}/plan`,
    data
  );
  return response.data;
};

/**
 * Update distribution
 */
export const updateDistribution = async (
  id: number,
  data: Partial<DistributionRes>
): Promise<DistributionRes> => {
  const response = await api.put<DistributionRes>(
    `${DISTRIBUTION_BASE}/updateDistribution/${id}`,
    data
  );
  return response.data;
};

/**
 * Delete distribution
 */
export const deleteDistribution = async (id: number): Promise<string> => {
  const response = await api.delete<string>(
    `${DISTRIBUTION_BASE}/deleteDistribution/${id}`
  );
  return response.data;
};

// ============ Dealer Manager APIs ============

/**
 * Get distributions for specific dealer
 */
export const getDistributionsByDealer = async (
  dealerId: number
): Promise<DistributionRes[]> => {
  const response = await api.get<DistributionRes[]>(
    `${DISTRIBUTION_BASE}/search/dealer/${dealerId}`
  );
  return response.data;
};

/**
 * Step 2: Dealer Manager phản hồi lời mời (accept/decline)
 */
export const respondToInvitation = async (
  id: number,
  accepted: boolean,
  notes?: string
): Promise<DistributionRes> => {
  const response = await api.put<DistributionRes>(
    `${DISTRIBUTION_BASE}/${id}/respond`,
    { 
      response: accepted ? 'ACCEPTED' : 'DECLINED',  // Backend expect "ACCEPTED" or "DECLINED"
      dealerNotes: notes                             // Backend expect "dealerNotes"
    }
  );
  return response.data;
};

/**
 * Step 3: Dealer Manager tạo đơn nhập hàng chi tiết
 */
export const submitDistributionOrder = async (
  id: number,
  data: DistributionOrderReq
): Promise<DistributionRes> => {
  try {
    const response = await api.put<DistributionRes>(
      `${DISTRIBUTION_BASE}/${id}/submit-order`,
      data
    );
    return response.data;
  } catch (err: any) {
    // Surface backend message when 4xx/5xx occurs
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    throw new Error(msg);
  }
};

/**
 * Step 6: Dealer Manager xác nhận đã nhận hàng
 */
export const confirmDistributionReceived = async (
  id: number,
  data: DistributionCompletionReq
): Promise<DistributionRes> => {
  const response = await api.put<DistributionRes>(
    `${DISTRIBUTION_BASE}/${id}/complete`,
    data
  );
  return response.data;
};

/**
 * Step 4a: Dealer Manager phản hồi về giá hãng (chấp nhận hoặc từ chối)
 */
export const respondToManufacturerPrice = async (
  id: number,
  accepted: boolean,
  dealerNotes?: string
): Promise<DistributionRes> => {
  try {
    const response = await api.put<DistributionRes>(
      `${DISTRIBUTION_BASE}/${id}/respond-price`,
      {
        decision: accepted ? 'PRICE_ACCEPTED' : 'PRICE_REJECTED',
        dealerNotes: dealerNotes || '',
      }
    );
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    throw new Error(msg);
  }
};

// ============ Common APIs ============

/**
 * Get distribution by ID
 */
export const getDistributionById = async (
  id: number
): Promise<DistributionRes> => {
  const response = await api.get<DistributionRes>(
    `${DISTRIBUTION_BASE}/${id}`
  );
  return response.data;
};

/**
 * Get distributions by category
 */
export const getDistributionsByCategory = async (
  categoryId: number
): Promise<DistributionRes[]> => {
  const response = await api.get<DistributionRes[]>(
    `${DISTRIBUTION_BASE}/search/category/${categoryId}`
  );
  return response.data;
};

/**
 * Get distribution statistics
 */
export const getDistributionStats = async (): Promise<DistributionStats> => {
  const response = await api.get<DistributionStats>(
    `${DISTRIBUTION_BASE}/stats`
  );
  return response.data;
};

/**
 * Get distribution statistics for dealer
 */
export const getDistributionStatsByDealer = async (
  dealerId: number
): Promise<DistributionStats> => {
  const response = await api.get<DistributionStats>(
    `${DISTRIBUTION_BASE}/stats/dealer/${dealerId}`
  );
  return response.data;
};

// Aliases for convenience
export const inviteDealer = sendDistributionInvitation;
export const getDistributions = getAllDistributions;
export const approveOrder = approveDistributionOrder;
export const planDelivery = planDistributionDelivery;
export const respondInvitation = respondToInvitation;
export const submitOrder = submitDistributionOrder;
export const confirmReceived = confirmDistributionReceived;
