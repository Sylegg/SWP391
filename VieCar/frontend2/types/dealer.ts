// Dealer Types
// Backend DealerStatus enum: ACTIVE, INACTIVE

export enum DealerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface DealerReq {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxcode: string;
  userId?: number; // ID của user có role dealer manager
  // status field is not in backend DealerReq
}

export interface DealerRes {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxcode: string;
  status: DealerStatus;
  creationDate: string | Date;
}

export type Dealer = DealerRes;
export type DealerRequest = DealerReq;
