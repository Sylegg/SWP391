// Dealer API functions
import api from './api';
import { DealerReq, DealerRes } from '@/types/dealer';

// Re-export types for convenience
export type { DealerReq, DealerRes };
export type Dealer = DealerRes;
export type DealerRequest = DealerReq;

const DEALER_BASE = '/api/dealer'; // Backend uses /api/dealer (singular)

// ============ Dealer APIs ============

/**
 * Get all dealers
 */
export const getAllDealers = async (): Promise<DealerRes[]> => {
  const response = await api.get<DealerRes[]>(`${DEALER_BASE}/listDealer`);
  return response.data;
};

/**
 * Search dealers by name
 */
export const searchDealersByName = async (name: string): Promise<DealerRes[]> => {
  const response = await api.get<DealerRes[]>(`${DEALER_BASE}/byName/${encodeURIComponent(name)}`);
  return response.data;
};

/**
 * Search dealers by address
 */
export const searchDealersByAddress = async (address: string): Promise<DealerRes[]> => {
  const response = await api.get<DealerRes[]>(`${DEALER_BASE}/byAddress/${encodeURIComponent(address)}`);
  return response.data;
};

/**
 * Get dealer by ID
 */
export const getDealerById = async (id: number): Promise<DealerRes> => {
  const response = await api.get<DealerRes>(`${DEALER_BASE}/dealerHome/${id}`);
  return response.data;
};

/**
 * Create a new dealer
 */
export const createDealer = async (data: DealerReq): Promise<DealerRes> => {
  console.log('Creating dealer with data:', data);
  try {
    const response = await api.post<DealerRes>(`${DEALER_BASE}/registerDealer`, data);
    console.log('Dealer created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating dealer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update an existing dealer
 */
export const updateDealer = async (id: number, data: DealerReq): Promise<DealerRes> => {
  console.log('Updating dealer:', id, data);
  try {
    const response = await api.put<DealerRes>(`${DEALER_BASE}/dealerHome/${id}`, data);
    console.log('Dealer updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating dealer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a dealer
 */
export const deleteDealer = async (id: number): Promise<string> => {
  const response = await api.delete<string>(`${DEALER_BASE}/${id}`);
  return response.data;
};

// Aliases for consistency
export const getDealers = getAllDealers;
export const getDealer = getDealerById;
export const searchDealers = searchDealersByName;
export const searchDealersByLocation = searchDealersByAddress;
