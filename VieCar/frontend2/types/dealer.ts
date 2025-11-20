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
  latitude?: number; // Geographic latitude
  longitude?: number; // Geographic longitude
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
  latitude?: number; // Geographic latitude (DECIMAL 10,8)
  longitude?: number; // Geographic longitude (DECIMAL 11,8)
  distance?: number; // Calculated distance from user (in km) - frontend only
}

export type Dealer = DealerRes;
export type DealerRequest = DealerReq;
