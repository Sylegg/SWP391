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
  stockInDate?: string | Date; // Ngày nhập kho (tùy chọn)
  
  // ✅ NEW: Manufacturer & Retail Price
  manufacturerPrice?: number; // Giá gốc từ hãng (chỉ set khi tạo mới, không update)
  retailPrice?: number; // Giá bán lẻ (dealer có thể update)
  
  dealerPrice?: number; // @Deprecated - backward compatibility
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
  color?: string;  // ✅ Màu sắc của xe (từ backend)
  battery: number;
  range: number;
  hp: number;
  torque: number;
  isSpecial: boolean;
  manufacture_date: string | Date;
  stockInDate?: string | Date;
  image: string;
  description: string;
  
  // ✅ NEW PRICE STRUCTURE
  manufacturerPrice?: number; // Giá gốc từ hãng (READ-ONLY, không được thay đổi)
  retailPrice?: number; // Giá bán lẻ của đại lý (CÓ THỂ update)
  price: number;  // @Deprecated: Backward compatibility (= retailPrice hoặc manufacturerPrice)
  
  status: ProductStatus;
  categoryId: number;
  dealerCategoryId: number;
  dealerId?: number; // ✅ ID của đại lý sở hữu xe này (từ DealerCategory)
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
  [ProductStatus.SOLDOUT]: "Đã bán",
  [ProductStatus.TEST_DRIVE]: "Xe lái thử",
  [ProductStatus.RESERVED]: "Có sẵn"
};

// Color variants for status badges
export const ProductStatusColors: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  [ProductStatus.INACTIVE]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  [ProductStatus.SOLDOUT]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  [ProductStatus.TEST_DRIVE]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [ProductStatus.RESERVED]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
};
