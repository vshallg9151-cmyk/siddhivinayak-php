/**
 * Booking Database Service (PHP + MySQL Backend Integration)
 * Siddhivinayak Tours & Travels
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { validateIndianMobile } from './smsGateway';
import { validateEmailAddress } from './emailService';
import { validateBookingDates } from './pricingService';

class BookingDatabaseService {
  /**
   * Fetch all bookings asynchronously from PHP MySQL Backend
   */
  async fetchRemoteBookings(params = {}) {
    const res = await apiClient.get(API_ENDPOINTS.BOOKINGS_LIST, params);
    if (res.success && Array.isArray(res.data?.bookings)) {
      return res.data.bookings;
    }
    return [];
  }

  async getBookings() {
    return this.fetchRemoteBookings();
  }

  async getBookingById(bookingId) {
    const res = await apiClient.get(API_ENDPOINTS.BOOKINGS_LIST, { search: bookingId });
    if (res.success && Array.isArray(res.data?.bookings) && res.data.bookings.length > 0) {
      return res.data.bookings.find(b => b.bookingId === bookingId) || res.data.bookings[0];
    }
    return null;
  }

  async getUserBookings(userId, email = '') {
    return this.fetchRemoteBookings({ userId, email });
  }

  async getBookingsForVehicle(vehicleId) {
    return this.fetchRemoteBookings({ vehicleId });
  }

  /**
   * Validate Booking Request
   */
  async validateBooking(bookingData) {
    const isSelfDrive = !bookingData.rentalType || 
      bookingData.rentalType === 'self-drive' || 
      bookingData.rentalType === 'Self Drive';

    if (!bookingData.userName || typeof bookingData.userName !== 'string' || bookingData.userName.trim().length < 2) {
      return { valid: false, message: 'Please provide a valid Customer Full Name.' };
    }

    const mobileCheck = validateIndianMobile(bookingData.userPhone || bookingData.mobile);
    if (!mobileCheck.valid) {
      return { valid: false, message: mobileCheck.error };
    }

    if (bookingData.userEmail || bookingData.email) {
      const emailCheck = await validateEmailAddress(bookingData.userEmail || bookingData.email);
      if (!emailCheck.valid) {
        return { valid: false, message: emailCheck.error };
      }
    }

    const dateCheck = validateBookingDates(
      bookingData.pickupDate,
      bookingData.pickupTime,
      bookingData.returnDate,
      bookingData.returnTime
    );
    if (!dateCheck.valid) {
      return { valid: false, message: dateCheck.error };
    }

    if (isSelfDrive) {
      if (!bookingData.dlNumber || typeof bookingData.dlNumber !== 'string' || bookingData.dlNumber.trim().length < 5) {
        return { valid: false, message: 'Driving Licence Number (DL) is mandatory for Self Drive rentals.' };
      }
    }

    return { valid: true, cleanMobile: mobileCheck.cleanMobile };
  }

  /**
   * Create Booking in PHP MySQL Backend
   */
  async createBooking(bookingData) {
    const isSelfDrive = !bookingData.rentalType || 
      bookingData.rentalType === 'self-drive' || 
      bookingData.rentalType === 'Self Drive';

    const validation = await this.validateBooking(bookingData);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const payload = {
      bookingId: bookingData.bookingId,
      userId: bookingData.userId || 'guest-user',
      userName: bookingData.userName.trim(),
      userEmail: (bookingData.userEmail || bookingData.email || '').toLowerCase().trim(),
      userPhone: validation.cleanMobile || bookingData.userPhone || bookingData.mobile,
      vehicleId: bookingData.vehicleId || 'veh-001',
      vehicleName: bookingData.vehicleName || 'Mahindra Thar 4x4',
      vehicleImage: bookingData.vehicleImage || '',
      pickupCity: bookingData.pickupCity || 'Mumbai',
      dropCity: bookingData.dropCity || bookingData.pickupCity || 'Mumbai',
      deliveryOption: bookingData.deliveryOption || 'Doorstep Delivery',
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime || '10:00',
      returnDate: bookingData.returnDate,
      returnTime: bookingData.returnTime || '18:00',
      rentalType: isSelfDrive ? 'Self Drive' : 'Chauffeur Driven',
      dlNumber: isSelfDrive ? bookingData.dlNumber : null,
      dlUploaded: isSelfDrive ? (bookingData.dlUploaded ?? true) : false,
      idUploaded: bookingData.idUploaded ?? true,
      baseFare: bookingData.baseFare,
      securityDeposit: bookingData.securityDeposit || 5000,
      totalAmount: bookingData.totalAmount,
      paymentStatus: bookingData.paymentStatus || 'PAID'
    };

    const res = await apiClient.post(API_ENDPOINTS.BOOKING_CREATE, payload);
    if (res.success && res.data?.booking) {
      return res.data.booking;
    }
    throw new Error(res.message || 'Booking creation failed');
  }

  /**
   * Update Booking Status in MySQL
   */
  async updateBookingStatus(bookingId, newStatus) {
    const res = await apiClient.post(API_ENDPOINTS.BOOKING_UPDATE, {
      bookingId,
      bookingStatus: newStatus
    });
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to update booking status');
  }

  /**
   * Cancel Booking
   */
  async cancelBooking(bookingId) {
    const res = await apiClient.post(API_ENDPOINTS.BOOKING_CANCEL, { bookingId });
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to cancel booking');
  }
}

export const bookingDB = new BookingDatabaseService();
