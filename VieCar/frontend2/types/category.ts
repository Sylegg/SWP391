// Category types matching backend DTOs

export interface CategoryReq {
  name: string;
  brand: string;
  basePrice: number; // Long in Java, but number in TypeScript (integer)
  warranty: number;  // Integer
  isSpecial: boolean;
  description: string;
  status: string;
  dealerId?: number; // Optional: For Dealer Manager categories
}

export interface CategoryRes {
  id: number;
  name: string;
  brand: string;
  basePrice: number; // Long in Java, but number in TypeScript
  warranty: number;
  isSpecial: boolean;
  description: string;
  status: string;
  dealerId?: number; // null if created by EVM/Admin, set if created by Dealer Manager
}

export interface DealerCategoryReq {
  name: string;
  quantity: number;
  description: string;
  status: string;
  categoryId: number;
  dealerId: number;
}

export interface DealerCategoryRes {
  id: number;
  name: string;
  quantity: number;
  description: string;
  status: string;
  categoryId: number;
  dealerId: number;
}

// Form data types (optional - for better type safety in forms)
export type CategoryFormData = Omit<CategoryReq, 'id'>;
export type DealerCategoryFormData = Omit<DealerCategoryReq, 'id'>;

// Simplified category for basic management (used in EVM Staff dashboard)
export interface SimpleCategoryReq {
  name: string;
  description?: string;
  status: boolean;
  isSpecial?: boolean;
}

export interface SimpleCategoryRes {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  isSpecial?: boolean;
}
