// Product types matching backend DTOs

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SOLDOUT = 'SOLDOUT',
  TEST_DRIVE = 'TEST_DRIVE',
  RESERVED = 'RESERVED'
}

export interface ProductReq {
  name: string;
  vinNum: string;
  engineNum: string;
  battery: number;
  range: number;
  hp: number;
  torque: number;
  color: string;
  manufacture_date: string | Date; // ISO date string or Date object
  dealerPrice: number;
  description: string;
  status: ProductStatus;
  categoryId: number;
  dealerCategoryId: number;
  image: string;
}

export interface ProductRes {
  id: number;
  name: string;
  vinNum: string;
  engineNum: string;
  color?: string;
  battery: number;
  range: number;
  hp: number;
  torque: number;
  isSpecial: boolean;
  manufacture_date: string | Date;
  image: string;
  description: string;
  price: number;
  status: ProductStatus;
  categoryId: number;
  dealerCategoryId: number;
}

// Form data types (for creating/updating products)
export type ProductFormData = Omit<ProductReq, 'id'>;

// Simplified product for listings
export interface ProductListItem {
  id: number;
  name: string;
  vinNum: string;
  engineNum: string;
  price: number;
  status: ProductStatus;
  categoryId: number;
  image?: string;
  isSpecial?: boolean;
}

// Product filter options
export interface ProductFilter {
  name?: string;
  vinNum?: string;
  engineNum?: string;
  categoryId?: number;
  dealerCategoryId?: number;
  status?: ProductStatus;
  isSpecial?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Product statistics (useful for dealer/admin dashboards)
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  soldout: number;
  testDrive: number;
  reserved: number;
  byCategory: Record<number, number>;
}

// Display labels for ProductStatus
export const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: "Đang hoạt động",
  [ProductStatus.INACTIVE]: "Không hoạt động",
  [ProductStatus.SOLDOUT]: "Đã bán hết",
  [ProductStatus.TEST_DRIVE]: "Xe lái thử",
  [ProductStatus.RESERVED]: "Đã đặt cọc"
};

// Color variants for status badges
export const ProductStatusColors: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [ProductStatus.INACTIVE]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  [ProductStatus.SOLDOUT]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [ProductStatus.TEST_DRIVE]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [ProductStatus.RESERVED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
};
