/**
 * Indian Cities & Regional Hubs Database Service (PHP + MySQL Backend Integration)
 * Siddhivinayak Tours & Travels
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { DEFAULT_INDIAN_CITIES } from '../data/indianCitiesData';

const CITIES_DB_KEY = 'siddhivinayak_cities_db_v1';

class CityDatabaseService {
  constructor() {
    this.cachedCities = DEFAULT_INDIAN_CITIES;
    this.initDatabase();
    this.fetchRemoteCities();
  }

  initDatabase() {
    try {
      const stored = localStorage.getItem(CITIES_DB_KEY);
      if (stored) {
        this.cachedCities = JSON.parse(stored);
      } else {
        localStorage.setItem(CITIES_DB_KEY, JSON.stringify(DEFAULT_INDIAN_CITIES));
      }
    } catch (err) {
      console.warn('Error initializing city database cache', err);
    }
  }

  saveCache(cities) {
    this.cachedCities = cities;
    try {
      localStorage.setItem(CITIES_DB_KEY, JSON.stringify(cities));
    } catch {}
  }

  async fetchRemoteCities() {
    try {
      const res = await apiClient.get(API_ENDPOINTS.CITIES_LIST, { all: 1 });
      if (res.success && Array.isArray(res.data?.cities)) {
        this.saveCache(res.data.cities);
        return res.data.cities;
      }
    } catch (err) {
      console.warn('[CityDB] Remote fetch fallback to cached cities:', err.message);
    }
    return this.getCities();
  }

  getCities() {
    const list = this.cachedCities || DEFAULT_INDIAN_CITIES;
    return list.filter(c => c.status !== 'DISABLED');
  }

  getAllCitiesForAdmin() {
    return this.cachedCities || DEFAULT_INDIAN_CITIES;
  }

  saveCities(cities) {
    this.saveCache(cities);
  }

  getPopularCities() {
    const cities = this.getCities();
    return cities.filter(c => (c.popular || c.isPopular) && c.status !== 'DISABLED');
  }

  searchCities(query = '') {
    const clean = query.toLowerCase().trim();
    const cities = this.getCities();
    
    if (!clean) return cities;

    return cities.filter(c => 
      c.name.toLowerCase().includes(clean) ||
      (c.district && c.district.toLowerCase().includes(clean)) ||
      (c.state && c.state.toLowerCase().includes(clean))
    );
  }

  /**
   * Super Admin Add City
   */
  async addCity({ name, district, state, popular = false, status = 'AVAILABLE' }) {
    try {
      const res = await apiClient.post(API_ENDPOINTS.CITIES_MANAGE, {
        name,
        district,
        state,
        popular,
        status
      });
      if (res.success && res.data?.city) {
        await this.fetchRemoteCities();
        return res.data.city;
      }
    } catch (err) {
      console.warn('[CityDB] Add city fallback:', err.message);
    }

    const cities = this.getAllCitiesForAdmin();
    const newCity = {
      id: `city-${Date.now()}`,
      name: name.trim(),
      district: district ? district.trim() : name.trim(),
      state: state.trim(),
      popular: Boolean(popular),
      status: status || 'AVAILABLE'
    };

    cities.push(newCity);
    this.saveCities(cities);
    return newCity;
  }

  /**
   * Super Admin Update City
   */
  async updateCity(cityId, updates) {
    try {
      const res = await apiClient.post(API_ENDPOINTS.CITIES_MANAGE, {
        id: cityId,
        ...updates
      });
      if (res.success) {
        await this.fetchRemoteCities();
      }
    } catch (err) {
      console.warn('[CityDB] Update city fallback:', err.message);
    }

    const cities = this.getAllCitiesForAdmin();
    const index = cities.findIndex(c => c.id === cityId);
    if (index !== -1) {
      cities[index] = { ...cities[index], ...updates };
      this.saveCities(cities);
      return cities[index];
    }
    return null;
  }

  /**
   * Super Admin Delete City
   */
  async deleteCity(cityId) {
    try {
      await apiClient.delete(API_ENDPOINTS.CITIES_MANAGE, { id: cityId });
      await this.fetchRemoteCities();
      return true;
    } catch (err) {
      console.warn('[CityDB] Delete city fallback:', err.message);
    }

    const cities = this.getAllCitiesForAdmin();
    const filtered = cities.filter(c => c.id !== cityId);
    this.saveCities(filtered);
    return true;
  }
}

export const cityDB = new CityDatabaseService();
