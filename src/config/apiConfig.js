/**
 * Centralized API Configuration for Siddhivinayak Tours & Travels
 * Configures the backend base URL and endpoints for PHP + MySQL on XAMPP Apache.
 */

// Determine API Base URL:
// 
// Development (npm run dev):
//   Vite proxies `/api/*` → `http://localhost/siddhivinayak-tours-PHP/api/*` (XAMPP Apache)
//   So we use the relative path `/api` here.
//
// Production (deployed to XAMPP htdocs/siddhivinayak-tours-PHP/):
//   React runs at: http://localhost/siddhivinayak-tours-PHP/
//   PHP API is at: http://localhost/siddhivinayak-tours-PHP/api/
//   Set VITE_API_BASE_URL in .env.local to override if needed.
//
const ENV_API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const API_BASE_URL = ENV_API_BASE
  ? (ENV_API_BASE.endsWith('/') ? ENV_API_BASE.slice(0, -1) : ENV_API_BASE)
  : '/api';

export const API_ENDPOINTS = {
  // Health
  HEALTH: `${API_BASE_URL}/health.php`,

  // Auth
  LOGIN: `${API_BASE_URL}/auth/login.php`,
  REGISTER: `${API_BASE_URL}/auth/register.php`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify_otp.php`,
  RESEND_OTP: `${API_BASE_URL}/auth/resend_otp.php`,
  SEND_OTP: `${API_BASE_URL}/auth/send_otp.php`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot_password.php`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset_password.php`,
  LOGOUT: `${API_BASE_URL}/auth/logout.php`,
  ME: `${API_BASE_URL}/auth/me.php`,

  // Users
  USERS_LIST: `${API_BASE_URL}/users/list.php`,
  USER_PROFILE: `${API_BASE_URL}/users/profile.php`,
  USER_STATUS: `${API_BASE_URL}/users/status.php`,
  USER_DELETE: `${API_BASE_URL}/users/delete.php`,
  CREATE_ADMIN: `${API_BASE_URL}/users/create_admin.php`,

  // Vehicles
  VEHICLES_LIST: `${API_BASE_URL}/vehicles/list.php`,
  VEHICLE_DETAILS: `${API_BASE_URL}/vehicles/details.php`,
  VEHICLE_MANAGE: `${API_BASE_URL}/vehicles/manage.php`,

  // Bookings
  BOOKING_CREATE: `${API_BASE_URL}/bookings/create.php`,
  BOOKINGS_LIST: `${API_BASE_URL}/bookings/list.php`,
  BOOKING_DETAILS: `${API_BASE_URL}/bookings/details.php`,
  BOOKING_UPDATE: `${API_BASE_URL}/bookings/update.php`,
  BOOKING_CANCEL: `${API_BASE_URL}/bookings/cancel.php`,

  // Cities
  CITIES_LIST: `${API_BASE_URL}/cities/list.php`,
  CITIES_MANAGE: `${API_BASE_URL}/cities/manage.php`,

  // Business Hub
  BUSINESS_HUB: `${API_BASE_URL}/business/hub.php`,
  VENDORS_MANAGE: `${API_BASE_URL}/business/vendors.php`,
  DRIVERS_MANAGE: `${API_BASE_URL}/business/drivers.php`,
  GUIDES_MANAGE: `${API_BASE_URL}/business/guides.php`,

  // Reviews, Offers & Packages
  REVIEWS_LIST: `${API_BASE_URL}/reviews/list.php`,
  REVIEW_CREATE: `${API_BASE_URL}/reviews/create.php`,
  OFFERS_LIST: `${API_BASE_URL}/offers/list.php`,
  PACKAGES_LIST: `${API_BASE_URL}/packages/list.php`,

  // Inquiries / Contact
  CONTACT_SUBMIT: `${API_BASE_URL}/contact/submit.php`,
  CONTACT_LIST: `${API_BASE_URL}/contact/list.php`,
};
