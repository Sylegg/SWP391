// Product API functions
import api from './api';
import { ProductReq, ProductRes, ProductStatus } from '@/types/product';

// Re-export types for convenience
export type { ProductReq, ProductRes };
export type Product = ProductRes;
export type ProductRequest = ProductReq;

const PRODUCT_BASE = '/api/products';

// ============ Product APIs ============

/**
 * Get all products
 */
export const getAllProducts = async (): Promise<ProductRes[]> => {
  const response = await api.get<ProductRes[]>(`${PRODUCT_BASE}/listProducts`);
  return response.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id: number): Promise<ProductRes> => {
  const response = await api.get<ProductRes>(`${PRODUCT_BASE}/search/id/${id}`);
  return response.data;
};

/**
 * Search products by name
 */
export const searchProductsByName = async (name: string): Promise<ProductRes[]> => {
  const response = await api.get<ProductRes[]>(`${PRODUCT_BASE}/search/name/${encodeURIComponent(name)}`);
  return response.data;
};

/**
 * Search products by VIN number
 */
export const searchProductsByVin = async (vinNum: string): Promise<ProductRes[]> => {
  const response = await api.get<ProductRes[]>(`${PRODUCT_BASE}/search/vin/${encodeURIComponent(vinNum)}`);
  return response.data;
};

/**
 * Search products by engine number
 */
export const searchProductsByEngine = async (engineNum: string): Promise<ProductRes[]> => {
  const response = await api.get<ProductRes[]>(`${PRODUCT_BASE}/search/engine/${encodeURIComponent(engineNum)}`);
  return response.data;
};

/**
 * Get products by category ID
 */
export const getProductsByCategory = async (categoryId: number): Promise<ProductRes[]> => {
  const response = await api.get<ProductRes[]>(`${PRODUCT_BASE}/search/category/${categoryId}`);
  return response.data;
};

/**
 * Create a new product
 */
export const createProduct = async (data: ProductReq): Promise<ProductRes> => {
  const response = await api.post<ProductRes>(`${PRODUCT_BASE}/addProduct`, data);
  return response.data;
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: number, data: ProductReq): Promise<ProductRes> => {
  const response = await api.put<ProductRes>(`${PRODUCT_BASE}/${id}`, data);
  return response.data;
};

/**
 * Delete a product (soft delete - sets status to INACTIVE)
 */
export const deleteProduct = async (id: number): Promise<string> => {
  const response = await api.delete<string>(`${PRODUCT_BASE}/delete/${id}`);
  return response.data;
};

// ============ Helper Functions ============

/**
 * Filter products by multiple criteria (client-side filtering)
 */
export const filterProducts = (
  products: ProductRes[],
  filters: {
    name?: string;
    vinNum?: string;
    categoryId?: number;
    dealerCategoryId?: number;
    status?: ProductStatus;
    isSpecial?: boolean;
  }
): ProductRes[] => {
  return products.filter(product => {
    if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    if (filters.vinNum && !product.vinNum.toLowerCase().includes(filters.vinNum.toLowerCase())) {
      return false;
    }
    if (filters.categoryId !== undefined && product.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.dealerCategoryId !== undefined && product.dealerCategoryId !== filters.dealerCategoryId) {
      return false;
    }
    if (filters.status && product.status !== filters.status) {
      return false;
    }
    if (filters.isSpecial !== undefined && product.isSpecial !== filters.isSpecial) {
      return false;
    }
    return true;
  });
};

/**
 * Get product statistics
 */
export const getProductStats = (products: ProductRes[]) => {
  return {
    total: products.length,
    active: products.filter(p => p.status === ProductStatus.ACTIVE).length,
    inactive: products.filter(p => p.status === ProductStatus.INACTIVE).length,
    soldout: products.filter(p => p.status === ProductStatus.SOLDOUT).length,
    testDrive: products.filter(p => p.status === ProductStatus.TEST_DRIVE).length,
    reserved: products.filter(p => p.status === ProductStatus.RESERVED).length,
    special: products.filter(p => p.isSpecial).length,
  };
};

/**
 * Format product price
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Format product date
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: ProductStatus): string => {
  switch (status) {
    case ProductStatus.ACTIVE:
      return 'green';
    case ProductStatus.INACTIVE:
      return 'gray';
    case ProductStatus.SOLDOUT:
      return 'red';
    case ProductStatus.TEST_DRIVE:
      return 'blue';
    case ProductStatus.RESERVED:
      return 'yellow';
    default:
      return 'gray';
  }
};

/**
 * Get status label (Vietnamese)
 */
export const getStatusLabel = (status: ProductStatus): string => {
  switch (status) {
    case ProductStatus.ACTIVE:
      return 'Hoạt động';
    case ProductStatus.INACTIVE:
      return 'Không hoạt động';
    case ProductStatus.SOLDOUT:
      return 'Đã bán hết';
    case ProductStatus.TEST_DRIVE:
      return 'Xe lái thử';
    case ProductStatus.RESERVED:
      return 'Đã đặt cọc';
    default:
      return status;
  }
};

// Alias functions for consistency
export const fetchProducts = getAllProducts;
export const fetchProductById = getProductById;
export const addProduct = createProduct;
export const removeProduct = deleteProduct;
