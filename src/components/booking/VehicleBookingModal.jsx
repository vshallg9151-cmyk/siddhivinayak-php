import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, ShieldCheck, Car, Users, Fuel, ArrowRight, CheckCircle, AlertTriangle, Sparkles, DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { vehicleAvailabilityService } from '../../services/vehicleAvailabilityService';
import { calculateBookingPrice, validateBookingDates } from '../../services/pricingService';
import { bookingDB } from '../../services/bookingDatabase';
import { sendSMSOTP, validateIndianMobile } from '../../services/smsGateway';
import { sendEmailOTP, validateEmailAddress } from '../../services/emailService';

export default function VehicleBookingModal({ vehicle, searchParams = {}, onClose, onBookingSuccess }) {
  const { user } = useAuth();

  const defaultDates = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const returnDay = new Date();
    returnDay.setDate(returnDay.getDate() + 4);
    const format = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return { pickup: format(tomorrow), returnD: format(returnDay) };
  })();

  const [pickupCity, setPickupCity] = useState(searchParams.city || vehicle?.location || 'Surat');
  const [dropCity, setDropCity] = useState(searchParams.returnCity || pickupCity);
  const [pickupDate, setPickupDate] = useState(searchParams.pickupDate || defaultDates.pickup);
  const [pickupTime, setPickupTime] = useState(searchParams.pickupTime || '10:00');
  const [returnDate, setReturnDate] = useState(searchParams.returnDate || defaultDates.returnD);
  const [returnTime, setReturnTime] = useState(searchParams.returnTime || '18:00');

  // Customer Information
  const [userName, setUserName] = useState(user?.name || 'Rahul Sharma');
  const [userEmail, setUserEmail] = useState(user?.email || 'rahul.sharma@example.com');
  const [userPhone, setUserPhone] = useState(user?.mobile || '9876543210');

  // Validation, Availability & Pricing State
  const [availCheck, setAvailCheck] = useState({ available: true, reason: null });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Authoritative Pricing calculation
  const priceDetails = calculateBookingPrice({
    pricePerDay: vehicle?.pricePerDay || 3499,
    rentalType: 'self-drive',
    deliveryOption: 'Doorstep Delivery',
    pickupCity,
    returnCity: dropCity,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    vehicleSecurityDeposit: vehicle?.securityDeposit || 5000
  });

  // Recalculate live availability whenever dates or vehicle change
  useEffect(() => {
    const checkAvailability = async () => {
      if (vehicle) {
        const dateCheck = validateBookingDates(pickupDate, pickupTime, returnDate, returnTime);
        if (!dateCheck.valid) {
          setAvailCheck({ available: false, reason: dateCheck.error });
          return;
        }

        const check = await vehicleAvailabilityService.isVehicleAvailable(
          vehicle.id,
          pickupDate,
          pickupTime,
          returnDate,
          returnTime
        );
        setAvailCheck(check);
      }
    };
    checkAvailability();
  }, [vehicle, pickupDate, pickupTime, returnDate, returnTime]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setFormError('');

    // 1. Validate Customer Name
    if (!userName.trim() || userName.trim().length < 2) {
      setFormError('Please provide a valid Full Name.');
      return;
    }

    // 2. Validate Indian Mobile
    const mobCheck = validateIndianMobile(userPhone);
    if (!mobCheck.valid) {
      setFormError(mobCheck.error);
      return;
    }

    // 3. Validate Email
    if (userEmail) {
      const emailCheck = await validateEmailAddress(userEmail);
      if (!emailCheck.valid) {
        setFormError(emailCheck.error);
        return;
      }
    }

    // 4. Re-verify availability to prevent double-booking race conditions
    const finalCheck = await vehicleAvailabilityService.isVehicleAvailable(
      vehicle.id,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime
    );

    if (!finalCheck.available) {
      setAvailCheck(finalCheck);
      setFormError(finalCheck.reason || 'Sorry, this vehicle is no longer available for the selected dates.');
      return;
    }

    setLoading(true);

    try {
      const generatedBookingId = `SVT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const newBooking = await bookingDB.createBooking({
        bookingId: generatedBookingId,
        userId: user?.id || 'guest-user',
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        userPhone: mobCheck.cleanMobile,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleImage: vehicle.images[0] || '',
        pickupCity,
        dropCity,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
        totalDays: priceDetails.rentalDays,
        baseFare: priceDetails.baseRental,
        taxes: priceDetails.gstTax,
        securityDeposit: priceDetails.securityDeposit,
        totalAmount: priceDetails.finalPayable,
        paymentStatus: 'PAID'
      });

      // Dispatch Notifications
      sendEmailOTP({
        email: userEmail,
        otp: newBooking.bookingId,
        name: userName
      }).catch(() => {});

      sendSMSOTP({
        mobile: mobCheck.cleanMobile,
        otp: newBooking.bookingId,
        name: userName
      }).catch(() => {});

      setConfirmedBooking(newBooking);
      if (onBookingSuccess) onBookingSuccess(newBooking);

    } catch (err) {
      setFormError(err.message || 'Failed to complete vehicle booking.');
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Live Booking Engine
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Vehicle Booking Checkout</h2>
        </div>

        {/* Confirmed Booking Screen */}
        {confirmedBooking ? (
          <div className="p-6 bg-emerald-950/80 border border-emerald-500/50 rounded-3xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-xl font-black text-white">Booking Confirmed! 🎉</h3>
              <p className="text-xs text-emerald-300 mt-1">
                Booking ID: <strong className="font-mono text-white">{confirmedBooking.bookingId}</strong>
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs font-mono space-y-2 text-slate-300">
              <p>Vehicle: <strong className="text-white">{confirmedBooking.vehicleName}</strong></p>
              <p>Dates: <strong className="text-amber-400">{confirmedBooking.pickupDate} to {confirmedBooking.returnDate}</strong></p>
              <p>Pickup City: <strong className="text-white">{confirmedBooking.pickupCity}</strong></p>
              <p>Total Paid: <strong className="text-emerald-400">₹{confirmedBooking.totalAmount.toLocaleString()}</strong></p>
            </div>

            <p className="text-[11px] text-slate-400">
              📱 Confirmation SMS, Email, and WhatsApp notifications have been dispatched.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
            >
              Done & View My Bookings
            </button>
          </div>
        ) : (
          /* Normal Booking Checkout Form */
          <form onSubmit={handleConfirmBooking} className="space-y-6">
            
            {/* Form Error Alert */}
            {formError && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-xs text-rose-200 flex items-center gap-3 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Double Booking Warning Alert */}
            {!availCheck.available && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-xs text-rose-200 flex items-center gap-3 animate-in fade-in">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <strong className="font-extrabold uppercase tracking-wider block text-rose-300">Booking Blocked</strong>
                  <span>{availCheck.reason || 'This vehicle is already booked for the selected dates.'}</span>
                </div>
              </div>
            )}

            {/* Vehicle Details Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={vehicle.images[0]}
                alt={vehicle.name}
                className="w-full sm:w-36 h-24 object-cover rounded-xl shrink-0"
              />
              <div className="space-y-1 w-full">
                <h4 className="font-extrabold text-white text-base">{vehicle.name}</h4>
                <p className="text-xs text-slate-400">{vehicle.model} • {vehicle.category}</p>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-300 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">{vehicle.fuelType}</span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">{vehicle.transmission}</span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">{vehicle.seats} Seats</span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 ml-auto">
                    ₹{vehicle.pricePerDay}/day
                  </span>
                </div>
              </div>
            </div>

            {/* Dates & Location Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pickup Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={pickupDate}
                  onClick={(e) => { try { if (e.target.showPicker) e.target.showPicker(); } catch {} }}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Return Date</label>
                <input
                  type="date"
                  required
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  value={returnDate}
                  onClick={(e) => { try { if (e.target.showPicker) e.target.showPicker(); } catch {} }}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Automatic Fare Calculation Breakdown Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
                Itemized Fare Breakdown ({priceDetails.rentalDays} Days)
              </span>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Base Rental Fare ({priceDetails.rentalDays} days × ₹{vehicle.pricePerDay})</span>
                <span className="font-mono">₹{priceDetails.baseRental.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Government GST (5%)</span>
                <span className="font-mono">₹{priceDetails.gstTax.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Refundable Security Deposit (Handed at pickup)</span>
                <span className="font-mono text-slate-300">₹{priceDetails.securityDeposit.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-amber-400 pt-2 border-t border-slate-800">
                <span>Total Payable Amount</span>
                <span className="text-base font-mono">₹{priceDetails.finalPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={!availCheck.available || loading}
              className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                availCheck.available && !loading
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Reservation...</span>
                </>
              ) : availCheck.available ? (
                <>
                  <span>Confirm & Complete Booking (₹{priceDetails.finalPayable.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Vehicle Unavailable for Selected Dates'
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
