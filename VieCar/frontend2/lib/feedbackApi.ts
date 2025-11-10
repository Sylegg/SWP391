import { API_BASE_URL } from './config';

export interface TestDriveFeedbackReq {
  testDriveId: number;
  rating: number; // 1-5
  comment?: string;
}

export interface TestDriveFeedbackRes {
  id: number;
  testDriveId: number;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createAt: string;
}

const FEEDBACK_BASE = '/testdrive-feedback';

/**
 * Create feedback for a test drive
 */
export async function createFeedback(data: TestDriveFeedbackReq): Promise<TestDriveFeedbackRes> {
  const response = await fetch(`${API_BASE_URL}${FEEDBACK_BASE}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create feedback');
  }
  
  return response.json();
}

/**
 * Get feedback for a specific test drive
 */
export async function getFeedbackByTestDriveId(testDriveId: number): Promise<TestDriveFeedbackRes[]> {
  const response = await fetch(`${API_BASE_URL}${FEEDBACK_BASE}/test-drive/${testDriveId}`);
  if (!response.ok) throw new Error('Failed to fetch feedback');
  return response.json();
}

/**
 * Get all feedback for a product
 */
export async function getFeedbackByProductId(productId: number): Promise<TestDriveFeedbackRes[]> {
  const response = await fetch(`${API_BASE_URL}${FEEDBACK_BASE}/product/${productId}`);
  if (!response.ok) throw new Error('Failed to fetch feedback');
  return response.json();
}

/**
 * Get average rating for a product
 */
export async function getAverageRatingByProductId(productId: number): Promise<number> {
  const response = await fetch(`${API_BASE_URL}${FEEDBACK_BASE}/product/${productId}/average`);
  if (!response.ok) throw new Error('Failed to fetch average rating');
  return response.json();
}

/**
 * Get all feedback by a user
 */
export async function getFeedbackByUserId(userId: number): Promise<TestDriveFeedbackRes[]> {
  const response = await fetch(`${API_BASE_URL}${FEEDBACK_BASE}/user/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch feedback');
  return response.json();
}
