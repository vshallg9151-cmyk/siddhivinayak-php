/**
 * Vehicle Database Service (PHP + MySQL Backend Integration)
 * Siddhivinayak Tours & Travels
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

class VehicleDatabaseService {
  /**
   * Fetch all vehicles asynchronously from PHP MySQL Backend
   */
  async fetchRemoteVehicles(params = {}) {
    const res = await apiClient.get(API_ENDPOINTS.VEHICLES_LIST, params);
    if (res.success && Array.isArray(res.data?.vehicles)) {
      return res.data.vehicles;
    }
    return [];
  }

  async getVehicles(params = {}) {
    return this.fetchRemoteVehicles(params);
  }

  async getVehicleById(id) {
    if (!id) return null;
    const res = await apiClient.get(API_ENDPOINTS.VEHICLES_LIST, { search: id });
    if (res.success && Array.isArray(res.data?.vehicles) && res.data.vehicles.length > 0) {
      return res.data.vehicles.find(v => v.id === id) || res.data.vehicles[0];
    }
    return null;
  }

  /**
   * Add New Vehicle to Fleet in PHP MySQL
   */
  async addVehicle(vehicleData) {
    const res = await apiClient.post(API_ENDPOINTS.VEHICLE_MANAGE, vehicleData);
    if (res.success && res.data?.vehicleId) {
      return { id: res.data.vehicleId, ...vehicleData };
    }
    throw new Error(res.message || 'Failed to add vehicle');
  }

  /**
   * Update Vehicle in PHP MySQL
   */
  async updateVehicle(vehicleId, updates) {
    const res = await apiClient.post(API_ENDPOINTS.VEHICLE_MANAGE, {
      id: vehicleId,
      ...updates
    });
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to update vehicle');
  }

  async setVehicleStatus(vehicleId, newStatus) {
    const res = await apiClient.post(API_ENDPOINTS.VEHICLE_MANAGE, {
      action: 'status',
      id: vehicleId,
      status: newStatus
    });
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to set vehicle status');
  }

  async deleteVehicle(vehicleId) {
    const res = await apiClient.delete(API_ENDPOINTS.VEHICLE_MANAGE, { id: vehicleId });
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to delete vehicle');
  }
}

export const vehicleDB = new VehicleDatabaseService();
