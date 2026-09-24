/**
 * Authoritative Business Hub Database Service (PHP + MySQL Backend Integration)
 * Siddhivinayak Tours & Travels
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { bookingDB } from './bookingDatabase';
import { userDB } from './userDatabase';
import { vehicleDB } from './vehicleDatabase';

class BusinessDatabaseService {
  async fetchRemoteHub() {
    const res = await apiClient.get(API_ENDPOINTS.BUSINESS_HUB);
    if (res.success && res.data) {
      return {
        vendors: res.data.vendors || [],
        drivers: res.data.drivers || [],
        guides: res.data.guides || [],
        staff: res.data.staff || [],
        inventory: res.data.inventory || [],
        ledger: res.data.ledger || [],
        documents: res.data.documents || []
      };
    }
    return { vendors: [], drivers: [], guides: [], staff: [], inventory: [], ledger: [], documents: [] };
  }

  async getStorageData() {
    return this.fetchRemoteHub();
  }

  /**
   * 1. STAFF ROSTER
   */
  async getStaff() {
    const data = await this.getStorageData();
    return data.staff || [];
  }

  /**
   * 2. VENDORS & HOTEL PARTNERS
   */
  async getVendors() {
    const data = await this.getStorageData();
    return data.vendors || [];
  }

  async addVendor(vendorData) {
    const res = await apiClient.post(API_ENDPOINTS.VENDORS_MANAGE, vendorData);
    if (res.success && res.data?.vendor) {
      return res.data.vendor;
    }
    throw new Error(res.message || 'Failed to add vendor');
  }

  async deleteVendor(id) {
    const res = await apiClient.delete(API_ENDPOINTS.VENDORS_MANAGE, { id });
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to delete vendor');
  }

  /**
   * 3. DRIVERS & FLEET ASSIGNMENT
   */
  async getDrivers() {
    const data = await this.getStorageData();
    return data.drivers || [];
  }

  async addDriver(driverData) {
    const res = await apiClient.post(API_ENDPOINTS.DRIVERS_MANAGE, driverData);
    if (res.success && res.data?.driver) {
      return res.data.driver;
    }
    throw new Error(res.message || 'Failed to add driver');
  }

  /**
   * 4. TOUR GUIDES
   */
  async getGuides() {
    const data = await this.getStorageData();
    return data.guides || [];
  }

  async addGuide(guideData) {
    const res = await apiClient.post(API_ENDPOINTS.GUIDES_MANAGE, guideData);
    if (res.success && res.data?.guide) {
      return res.data.guide;
    }
    throw new Error(res.message || 'Failed to add guide');
  }

  /**
   * 5. DYNAMIC INVENTORY
   */
  async getInventory() {
    const data = await this.getStorageData();
    return data.inventory || [];
  }

  /**
   * 6. GST ACCOUNTING LEDGER
   */
  async getLedger() {
    const data = await this.getStorageData();
    return data.ledger || [];
  }

  /**
   * 7. DOCUMENT VAULT
   */
  async getDocuments() {
    const data = await this.getStorageData();
    return data.documents || [];
  }
}

export const businessDB = new BusinessDatabaseService();
