/**
 * Authoritative User Database Service (PHP + MySQL Backend Integration)
 * Siddhivinayak Tours & Travels
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { hashPassword } from './jwtAuth.js';

// Predefined Super Admin Owner Credentials (Pre-verified)
export const PREDEFINED_SUPER_ADMIN = {
  id: 'super-admin-owner-001',
  name: 'Vishal (Super Admin & Owner)',
  email: 'vshallg9151@gmail.com',
  mobile: '9173746558',
  password: hashPassword('siddhi@2005'),
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  isOwner: true,
  emailVerified: true,
  mobileVerified: true,
  mustChangePassword: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString()
};

class UserDatabaseService {
  /**
   * Fetch all users asynchronously from PHP MySQL Backend
   */
  async fetchRemoteUsers() {
    const res = await apiClient.get(API_ENDPOINTS.USERS_LIST);
    if (res.success && Array.isArray(res.data?.users)) {
      return res.data.users;
    }
    return [];
  }

  async getUsers() {
    return this.fetchRemoteUsers();
  }

  async findByEmail(email) {
    const users = await this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Login Authentication via PHP MySQL API
   */
  async login({ email, password }) {
    const res = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
    if (res.success && res.data?.user) {
      return {
        user: res.data.user,
        token: res.data.token,
        redirectUrl: res.data.redirectUrl || '/user/dashboard'
      };
    }
    throw new Error(res.message || 'Login failed');
  }

  /**
   * Register User via PHP MySQL API
   */
  async registerUser({ name, email, mobile, password, confirmPassword }) {
    const res = await apiClient.post(API_ENDPOINTS.REGISTER, {
      name,
      email,
      mobile,
      password,
      confirmPassword: confirmPassword || password
    });

    if (res.success && res.data?.user) {
      return {
        user: res.data.user,
        emailDelivery: res.data.emailDelivery,
        requiresVerification: true
      };
    }
    throw new Error(res.message || 'Registration failed');
  }

  /**
   * Verify Email OTP via PHP MySQL Backend
   */
  async verifyEmailOTP(userId, otpInput, email = '') {
    const res = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, {
      userId,
      email,
      otp: otpInput
    });

    if (res.success && res.data?.user) {
      return res.data.user;
    }
    throw new Error(res.message || 'Invalid OTP code');
  }

  /**
   * Resend Email OTP
   */
  async resendEmailOTP(userId, email = '') {
    const res = await apiClient.post(API_ENDPOINTS.RESEND_OTP, { userId, email });
    if (res.success) {
      return {
        user: res.data?.user,
        delivery: res.data?.delivery
      };
    }
    throw new Error(res.message || 'Failed to resend OTP');
  }

  /**
   * Super Admin Create Admin Account
   */
  async createAdminAccount({ name, email, mobile, tempPassword }) {
    const res = await apiClient.post(API_ENDPOINTS.CREATE_ADMIN, {
      name,
      email,
      mobile,
      tempPassword
    });

    if (res.success && res.data?.admin) {
      return { user: res.data.admin, emailDelivery: { success: true } };
    }
    throw new Error(res.message || 'Failed to create admin');
  }

  /**
   * Super Admin Toggle User Status
   */
  async toggleUserStatus(userId, nextStatus = '') {
    const res = await apiClient.post(API_ENDPOINTS.USER_STATUS, { id: userId, status: nextStatus });
    if (res.success && res.data?.user) {
      return res.data.user;
    }
    throw new Error(res.message || 'Failed to toggle user status');
  }

  /**
   * Super Admin Delete User
   */
  async deleteUser(userId) {
    const res = await apiClient.post(API_ENDPOINTS.USER_DELETE, { id: userId });
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to delete user');
  }

  /**
   * Update Profile Details
   */
  async updateProfile(userId, { name, mobile, oldPassword, newPassword }) {
    const res = await apiClient.post(API_ENDPOINTS.USER_PROFILE, {
      id: userId,
      name,
      mobile,
      oldPassword,
      newPassword
    });
    if (res.success && res.data?.user) {
      return res.data.user;
    }
    throw new Error(res.message || 'Profile update failed');
  }

  /**
   * Reset Password
   */
  async resetPassword({ userId, newPassword }) {
    const res = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, {
      userId,
      newPassword
    });
    if (res.success && res.data?.user) {
      return res.data.user;
    }
    throw new Error(res.message || 'Password reset failed');
  }
}

export const userDB = new UserDatabaseService();

