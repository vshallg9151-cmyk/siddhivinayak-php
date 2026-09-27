import { vehicleDB } from './vehicleDatabase';
import { bookingDB } from './bookingDatabase';

/**
 * Check if two date-time ranges overlap
 */
export function checkDateTimeOverlap(startA, endA, startB, endB) {
  return (startA < endB) && (endA > startB);
}

/**
 * Convert Date String + Time String into JavaScript Timestamp
 */
export function parseDateTime(dateStr, timeStr = '10:00') {
  if (!dateStr) return Date.now();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(dateStr);
  d.setHours(hours || 10, minutes || 0, 0, 0);
  return d.getTime();
}

class VehicleAvailabilityService {
  /**
   * Check if a specific vehicle is available for a date & time range
   */
  async isVehicleAvailable(vehicleId, pickupDate, pickupTime = '10:00', returnDate, returnTime = '18:00') {
    const vehicle = await vehicleDB.getVehicleById(vehicleId);

    if (!vehicle) {
      return { available: false, reason: 'Vehicle not found.' };
    }

    if (vehicle.status === 'MAINTENANCE') {
      return { available: false, reason: 'This vehicle is currently under scheduled maintenance 🔧.' };
    }

    if (vehicle.status === 'INACTIVE') {
      return { available: false, reason: 'This vehicle is currently inactive ⚫.' };
    }

    // Check active non-cancelled bookings for overlapping dates & times
    const existingBookings = await bookingDB.getBookingsForVehicle(vehicleId);
    const reqStart = parseDateTime(pickupDate, pickupTime);
    const reqEnd = parseDateTime(returnDate, returnTime);

    for (const b of existingBookings) {
      const bStart = parseDateTime(b.pickupDate, b.pickupTime);
      const bEnd = parseDateTime(b.returnDate, b.returnTime);

      if (checkDateTimeOverlap(reqStart, reqEnd, bStart, bEnd)) {
        return {
          available: false,
          reason: 'This vehicle is already booked for the selected dates.'
        };
      }
    }

    return { available: true, reason: null };
  }

  /**
   * Search all vehicles with computed live status for given criteria
   */
  async searchAvailableVehicles({ city, pickupDate, pickupTime = '10:00', returnDate, returnTime = '18:00', category }) {
    const allVehicles = await vehicleDB.getVehicles();

    return Promise.all(allVehicles.map(async veh => {
      // Location match check (if city provided)
      const locationMatch = !city || veh.location.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(veh.location.toLowerCase());
      
      // Category match check
      const categoryMatch = !category || category === 'ALL' || veh.category.toLowerCase().includes(category.toLowerCase());

      // Live Availability check
      const availCheck = await this.isVehicleAvailable(veh.id, pickupDate, pickupTime, returnDate, returnTime);

      return {
        ...veh,
        isLocationMatch: locationMatch,
        isCategoryMatch: categoryMatch,
        isLiveAvailable: availCheck.available,
        unavailabilityReason: availCheck.reason
      };
    }));
  }

  /**
   * Automatic Fare Calculator Engine
   */
  calculateFare({ pricePerDay, pickupDate, pickupTime = '10:00', returnDate, returnTime = '18:00' }) {
    const dailyRate = Number(pricePerDay) || 3999;
    
    if (!pickupDate || !returnDate) {
      return {
        totalDays: 1,
        baseFare: dailyRate,
        taxes: Math.round(dailyRate * 0.18),
        additionalCharges: 250,
        totalAmount: dailyRate + Math.round(dailyRate * 0.18) + 250
      };
    }

    const startMs = parseDateTime(pickupDate, pickupTime);
    const endMs = parseDateTime(returnDate, returnTime);
    
    const diffMs = Math.max(endMs - startMs, 0);
    const diffHours = diffMs / (1000 * 60 * 60);

    // Calculate total days (minimum 1 day, 24 hours per day)
    let totalDays = Math.ceil(diffHours / 24);
    if (totalDays <= 0) totalDays = 1;

    const baseFare = dailyRate * totalDays;
    const taxes = Math.round(baseFare * 0.18); // 18% GST
    const additionalCharges = 250; // Comprehensive Insurance & Platform Fee
    const totalAmount = baseFare + taxes + additionalCharges;

    return {
      totalDays,
      diffHours: Math.round(diffHours),
      baseFare,
      taxes,
      additionalCharges,
      totalAmount
    };
  }
}

export const vehicleAvailabilityService = new VehicleAvailabilityService();
