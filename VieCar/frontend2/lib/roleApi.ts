import api from './api';

export interface RoleDto {
  id: number;
  name: string;
  description?: string;
}

const ROLE_BASE_URL = '/role';

/**
 * Lấy tất cả roles
 */
export const getAllRoles = async (): Promise<RoleDto[]> => {
  try {
    const response = await api.get<RoleDto[]>(ROLE_BASE_URL);
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to fetch roles';
    throw new Error(msg);
  }
};

/**
 * Tạo role mới
 */
export const createRole = async (roleData: Omit<RoleDto, 'id'>): Promise<RoleDto> => {
  try {
    const response = await api.post<RoleDto>(ROLE_BASE_URL, roleData);
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to create role';
    throw new Error(msg);
  }
};

/**
 * Cập nhật role
 */
export const updateRole = async (id: number, roleData: Partial<RoleDto>): Promise<RoleDto> => {
  try {
    const response = await api.put<RoleDto>(`${ROLE_BASE_URL}/${id}`, roleData);
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to update role';
    throw new Error(msg);
  }
};

/**
 * Xóa role
 */
export const deleteRole = async (id: number): Promise<void> => {
  try {
    await api.delete(`${ROLE_BASE_URL}/${id}`);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to delete role';
    throw new Error(msg);
  }
};
