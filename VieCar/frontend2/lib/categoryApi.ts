// Category API functions
import api from './api';
import { CategoryReq, CategoryRes, DealerCategoryReq, DealerCategoryRes } from '@/types/category';

// Re-export types for convenience
export type { CategoryReq, CategoryRes, DealerCategoryReq, DealerCategoryRes };
export type Category = CategoryRes;
export type CategoryRequest = CategoryReq;

const CATEGORY_BASE = '/api/categories';
const DEALER_CATEGORY_BASE = '/api/dealerCategories';

// ============ Category APIs ============

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<CategoryRes[]> => {
  const response = await api.get<CategoryRes[]>(`${CATEGORY_BASE}/listCategories`);
  return response.data;
};

/**
 * Search categories by name
 */
export const searchCategoriesByName = async (name: string): Promise<CategoryRes[]> => {
  const response = await api.get<CategoryRes[]>(`${CATEGORY_BASE}/search/name/${encodeURIComponent(name)}`);
  return response.data;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: number): Promise<CategoryRes> => {
  const response = await api.get<CategoryRes>(`${CATEGORY_BASE}/search/id/${id}`);
  return response.data;
};

/**
 * Create a new category
 */
export const createCategory = async (data: CategoryReq): Promise<CategoryRes> => {
  console.log('Creating category with data:', data);
  try {
    const response = await api.post<CategoryRes>(`${CATEGORY_BASE}/create`, data);
    console.log('Category created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating category:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (id: number, data: CategoryReq): Promise<CategoryRes> => {
  const response = await api.put<CategoryRes>(`${CATEGORY_BASE}/update/${id}`, data);
  return response.data;
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: number): Promise<string> => {
  const response = await api.delete<string>(`${CATEGORY_BASE}/delete/${id}`);
  return response.data;
};

/**
 * Get special categories
 */
export const getSpecialCategories = async (): Promise<CategoryRes[]> => {
  const response = await api.get<CategoryRes[]>(`${CATEGORY_BASE}/search/special`);
  return response.data;
};

// Alias for consistency
export const getCategoriesSpecial = getSpecialCategories;

/**
 * Get active categories
 */
export const getActiveCategories = async (): Promise<CategoryRes[]> => {
  const response = await api.get<CategoryRes[]>(`${CATEGORY_BASE}/search/active`);
  return response.data;
};

/**
 * Get categories by status
 */
export const getCategoriesByStatus = async (status: boolean): Promise<CategoryRes[]> => {
  if (status) {
    return getActiveCategories();
  }
  // For inactive, filter from all categories
  const allCategories = await getAllCategories();
  return allCategories.filter(cat => !cat.status);
};

/**
 * Get categories sorted by name
 */
export const getCategoriesSortedByName = async (ascending: boolean = true): Promise<CategoryRes[]> => {
  const categories = await getAllCategories();
  return categories.sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
};

/**
 * Get categories with warranty greater than specified years
 */
export const getCategoriesByWarranty = async (years: number): Promise<CategoryRes[]> => {
  const response = await api.get<CategoryRes[]>(`${CATEGORY_BASE}/search/warranty/${years}`);
  return response.data;
};

/**
 * Get categories by brand
 */
export const getCategoriesByBrand = async (brand: string): Promise<CategoryRes[]> => {
  const response = await api.get<CategoryRes[]>(`${CATEGORY_BASE}/search/brand/${encodeURIComponent(brand)}`);
  return response.data;
};

// ============ Dealer Category APIs ============

/**
 * Get all dealer categories
 */
export const getAllDealerCategories = async (): Promise<DealerCategoryRes[]> => {
  const response = await api.get<DealerCategoryRes[]>(`${DEALER_CATEGORY_BASE}/listDealerCategories`);
  return response.data;
};

/**
 * Get dealer category by ID
 */
export const getDealerCategoryById = async (id: number): Promise<DealerCategoryRes> => {
  const response = await api.get<DealerCategoryRes>(`${DEALER_CATEGORY_BASE}/search/${id}`);
  return response.data;
};

/**
 * Create a new dealer category
 */
export const createDealerCategory = async (data: DealerCategoryReq): Promise<DealerCategoryRes> => {
  const response = await api.post<DealerCategoryRes>(`${DEALER_CATEGORY_BASE}/create`, data);
  return response.data;
};

/**
 * Update an existing dealer category
 */
export const updateDealerCategory = async (id: number, data: DealerCategoryReq): Promise<DealerCategoryRes> => {
  const response = await api.put<DealerCategoryRes>(`${DEALER_CATEGORY_BASE}/update/${id}`, data);
  return response.data;
};

/**
 * Delete a dealer category
 */
export const deleteDealerCategory = async (id: number): Promise<string> => {
  const response = await api.delete<string>(`${DEALER_CATEGORY_BASE}/delete/${id}`);
  return response.data;
};
