/**
 * Authoritative HTTP API Client for PHP + MySQL Backend
 * Siddhivinayak Tours & Travels
 */

import { API_BASE_URL } from '../config/apiConfig';

const AUTH_TOKEN_KEY = 'siddhivinayak_auth_jwt_token_v3';

class ApiClient {
  /**
   * Get Current Stored Authorization Token
   */
  getToken() {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  /**
   * Base Fetch Request with Headers & JSON Serialization
   */
  async request(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        // Non-JSON response (e.g. server error HTML or raw text)
        data = { success: response.ok, message: text || 'Server response error' };
      }

      if (!response.ok) {
        const error = new Error(data.message || data.error || `HTTP error ${response.status}`);
        error.status = response.status;
        error.data = data;
        error.unverifiedUser = data.data?.unverifiedUser || data.unverifiedUser;
        error.requiresVerification = data.data?.requiresVerification || data.requiresVerification;
        throw error;
      }

      return data;
    } catch (error) {
      // Re-throw structured API errors
      throw error;
    }
  }

  get(url, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request(fullUrl, { method: 'GET' });
  }

  post(url, body = {}) {
    return this.request(url, { method: 'POST', body });
  }

  put(url, body = {}) {
    return this.request(url, { method: 'PUT', body });
  }

  patch(url, body = {}) {
    return this.request(url, { method: 'PATCH', body });
  }

  delete(url, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request(fullUrl, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
