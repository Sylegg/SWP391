import api from '../api';
import {
  Vehicle,
  DealerInventoryItem,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleFilterParams,
  VehicleStatsResponse
} from '@/types/vehicle';

export class VehicleService {
  // Get all vehicles in dealer inventory
  static async getDealerVehicles(
    dealerId: string,
    params?: VehicleFilterParams
  ): Promise<{ data: DealerInventoryItem[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.get(`/api/dealer/${dealerId}/vehicles`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dealer vehicles:', error);
      throw error;
    }
  }

  // Get vehicle statistics for dealer
  static async getDealerVehicleStats(dealerId: string): Promise<VehicleStatsResponse> {
    try {
      const response = await api.get(`/api/dealer/${dealerId}/vehicles/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      throw error;
    }
  }

  // Get single vehicle details
  static async getVehicleById(vehicleId: string): Promise<Vehicle> {
    try {
      const response = await api.get(`/api/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  }

  // Create new vehicle in inventory
  static async createVehicle(
    dealerId: string,
    data: CreateVehicleRequest
  ): Promise<DealerInventoryItem> {
    try {
      const response = await api.post(`/api/dealer/${dealerId}/vehicles`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  // Update vehicle information
  static async updateVehicle(
    vehicleId: string,
    data: UpdateVehicleRequest
  ): Promise<DealerInventoryItem> {
    try {
      const response = await api.put(`/api/vehicles/${vehicleId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  // Delete vehicle from inventory
  static async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      await api.delete(`/api/vehicles/${vehicleId}`);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  // Update vehicle status
  static async updateVehicleStatus(
    vehicleId: string,
    status: string
  ): Promise<DealerInventoryItem> {
    try {
      const response = await api.patch(`/api/vehicles/${vehicleId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  }

  // Bulk delete vehicles
  static async bulkDeleteVehicles(vehicleIds: string[]): Promise<void> {
    try {
      await api.post('/api/vehicles/bulk-delete', { vehicleIds });
    } catch (error) {
      console.error('Error bulk deleting vehicles:', error);
      throw error;
    }
  }

  // Get available vehicle models
  static async getAvailableModels(): Promise<string[]> {
    try {
      const response = await api.get('/api/vehicles/models');
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
}
