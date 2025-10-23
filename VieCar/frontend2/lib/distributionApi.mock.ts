// MOCK MODE for Distribution API
// Use this to test UI without backend
// Replace distributionApi.ts imports with this file temporarily

import {
  DistributionRes,
  DistributionInvitationReq,
  DistributionOrderReq,
  DistributionApprovalReq,
  DistributionPlanningReq,
  DistributionCompletionReq,
  DistributionStats,
  DistributionStatus,
} from '@/types/distribution';

// Mock delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (in-memory)
let mockDistributions: DistributionRes[] = [
  {
    id: 1,
    status: DistributionStatus.INVITED,
    dealerId: 1,
    dealerName: "VinFast Hà Nội",
    categoryId: 1,
    categoryName: "Xe điện 4 bánh",
    products: [],
    invitationMessage: "Hãng mở đợt phân phối tháng 11, quý đại lý có muốn nhập không?",
    deadline: "2025-11-30",
    createdAt: "2025-10-23T10:00:00Z",
    invitedAt: "2025-10-23T10:00:00Z",
  },
  {
    id: 2,
    status: DistributionStatus.PENDING,
    dealerId: 2,
    dealerName: "VinFast TP.HCM",
    categoryId: 1,
    categoryName: "Xe điện 4 bánh",
    products: [
      {
        id: 101,
        name: "VF5 Plus",
        vinNum: "VN123456789",
        engineNum: "ENG123",
        battery: 42.2,
        range: 300,
        hp: 134,
        torque: 135,
        isSpecial: false,
        manufacture_date: "2025-01-01",
        image: "",
        description: "VF5 Plus màu đỏ",
        price: 450000000,
        status: 'ACTIVE' as any,
        categoryId: 1,
        dealerCategoryId: 1,
      }
    ],
    invitationMessage: "Lời mời nhập hàng tháng 10",
    dealerNotes: "Chúng tôi muốn nhập 3 xe VF5",
    createdAt: "2025-10-20T10:00:00Z",
    submittedAt: "2025-10-21T10:00:00Z",
  },
];

let nextId = 3;

// ============ EVM Staff APIs ============

export const sendDistributionInvitation = async (
  data: DistributionInvitationReq
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: sendDistributionInvitation', data);
  await delay(500);
  
  const newDistribution: DistributionRes = {
    id: nextId++,
    status: DistributionStatus.INVITED,
    dealerId: data.dealerId,
    dealerName: `Dealer #${data.dealerId}`,
    categoryId: 0,
    products: [],
    invitationMessage: data.message,
    deadline: data.deadline,
    createdAt: new Date().toISOString(),
    invitedAt: new Date().toISOString(),
  };
  
  mockDistributions.push(newDistribution);
  return newDistribution;
};

export const getAllDistributions = async (): Promise<DistributionRes[]> => {
  console.log('🎭 MOCK: getAllDistributions');
  await delay(300);
  return [...mockDistributions];
};

export const getDistributionsByStatus = async (
  status: string
): Promise<DistributionRes[]> => {
  console.log('🎭 MOCK: getDistributionsByStatus', status);
  await delay(300);
  return mockDistributions.filter(d => d.status === status);
};

export const approveDistributionOrder = async (
  id: number,
  data: DistributionApprovalReq
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: approveDistributionOrder', id, data);
  await delay(500);
  
  const dist = mockDistributions.find(d => d.id === id);
  if (!dist) throw new Error('Distribution not found');
  
  dist.status = data.approved ? DistributionStatus.CONFIRMED : DistributionStatus.CANCELED;
  dist.evmNotes = data.evmNotes;
  dist.approvedAt = new Date().toISOString();
  
  return dist;
};

export const planDistributionDelivery = async (
  id: number,
  data: DistributionPlanningReq
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: planDistributionDelivery', id, data);
  await delay(500);
  
  const dist = mockDistributions.find(d => d.id === id);
  if (!dist) throw new Error('Distribution not found');
  
  dist.status = DistributionStatus.PLANNED;
  dist.estimatedDeliveryDate = data.estimatedDeliveryDate;
  dist.evmNotes = data.planningNotes;
  dist.plannedAt = new Date().toISOString();
  
  return dist;
};

export const updateDistribution = async (
  id: number,
  data: Partial<DistributionRes>
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: updateDistribution', id, data);
  await delay(500);
  
  const dist = mockDistributions.find(d => d.id === id);
  if (!dist) throw new Error('Distribution not found');
  
  Object.assign(dist, data);
  return dist;
};

export const deleteDistribution = async (id: number): Promise<string> => {
  console.log('🎭 MOCK: deleteDistribution', id);
  await delay(500);
  
  mockDistributions = mockDistributions.filter(d => d.id !== id);
  return 'Deleted successfully';
};

// ============ Dealer Manager APIs ============

export const getDistributionsByDealer = async (
  dealerId: number
): Promise<DistributionRes[]> => {
  console.log('🎭 MOCK: getDistributionsByDealer', dealerId);
  await delay(300);
  return mockDistributions.filter(d => d.dealerId === dealerId);
};

export const respondToInvitation = async (
  id: number,
  accepted: boolean,
  notes?: string
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: respondToInvitation', id, accepted, notes);
  await delay(500);
  
  const dist = mockDistributions.find(d => d.id === id);
  if (!dist) throw new Error('Distribution not found');
  
  dist.status = accepted ? DistributionStatus.ACCEPTED : DistributionStatus.DECLINED;
  dist.dealerNotes = notes;
  dist.respondedAt = new Date().toISOString();
  
  return dist;
};

export const submitDistributionOrder = async (
  id: number,
  data: DistributionOrderReq
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: submitDistributionOrder', id, data);
  await delay(500);
  
  const dist = mockDistributions.find(d => d.id === id);
  if (!dist) throw new Error('Distribution not found');
  
  dist.status = DistributionStatus.PENDING;
  dist.categoryId = data.categoryId;
  dist.dealerNotes = data.notes;
  dist.requestedDeliveryDate = data.requestedDeliveryDate;
  dist.submittedAt = new Date().toISOString();
  
  return dist;
};

export const confirmDistributionReceived = async (
  id: number,
  data: DistributionCompletionReq
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: confirmDistributionReceived', id, data);
  await delay(500);
  
  const dist = mockDistributions.find(d => d.id === id);
  if (!dist) throw new Error('Distribution not found');
  
  dist.status = DistributionStatus.COMPLETED;
  dist.actualDeliveryDate = data.actualDeliveryDate;
  dist.receivedQuantity = data.receivedQuantity;
  dist.feedback = data.feedback;
  dist.completedAt = new Date().toISOString();
  
  return dist;
};

// ============ Common APIs ============

export const getDistributionById = async (
  id: number
): Promise<DistributionRes> => {
  console.log('🎭 MOCK: getDistributionById', id);
  await delay(300);
  
  const dist = mockDistributions.find(d => d.id === id);
  if (!dist) throw new Error('Distribution not found');
  
  return dist;
};

export const getDistributionsByCategory = async (
  categoryId: number
): Promise<DistributionRes[]> => {
  console.log('🎭 MOCK: getDistributionsByCategory', categoryId);
  await delay(300);
  return mockDistributions.filter(d => d.categoryId === categoryId);
};

export const getDistributionStats = async (): Promise<DistributionStats> => {
  console.log('🎭 MOCK: getDistributionStats');
  await delay(300);
  
  return {
    totalInvitations: mockDistributions.filter(d => d.status === DistributionStatus.INVITED).length,
    pendingApproval: mockDistributions.filter(d => d.status === DistributionStatus.PENDING).length,
    confirmed: mockDistributions.filter(d => d.status === DistributionStatus.CONFIRMED).length,
    completed: mockDistributions.filter(d => d.status === DistributionStatus.COMPLETED).length,
    totalValue: 0,
  };
};

export const getDistributionStatsByDealer = async (
  dealerId: number
): Promise<DistributionStats> => {
  console.log('🎭 MOCK: getDistributionStatsByDealer', dealerId);
  await delay(300);
  
  const dealerDists = mockDistributions.filter(d => d.dealerId === dealerId);
  
  return {
    totalInvitations: dealerDists.filter(d => d.status === DistributionStatus.INVITED).length,
    pendingApproval: dealerDists.filter(d => d.status === DistributionStatus.PENDING).length,
    confirmed: dealerDists.filter(d => d.status === DistributionStatus.CONFIRMED).length,
    completed: dealerDists.filter(d => d.status === DistributionStatus.COMPLETED).length,
    totalValue: 0,
  };
};

// Aliases
export const inviteDealer = sendDistributionInvitation;
export const getDistributions = getAllDistributions;
export const approveOrder = approveDistributionOrder;
export const planDelivery = planDistributionDelivery;
export const respondInvitation = respondToInvitation;
export const submitOrder = submitDistributionOrder;
export const confirmReceived = confirmDistributionReceived;

console.log('🎭 MOCK MODE ACTIVE - Distribution API using mock data');
