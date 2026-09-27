import React, { useState } from 'react';
import StepProgressHeader from '../StepProgressHeader';
import AvailabilityCalendar from '../AvailabilityCalendar';
import BackgroundWrapper from '../../common/BackgroundWrapper';
import { useBooking } from '../../../context/BookingContext';
import { validateBookingDates, calculateBookingPrice } from '../../../services/pricingService';
import { vehicleAvailabilityService } from '../../../services/vehicleAvailabilityService';
import { Calendar, Clock, ArrowLeft, ArrowRight, AlertTriangle, MapPin, User, ShieldCheck, Sparkles } from 'lucide-react';

export default function DateTimePage({ onNavigate }) {
  const { bookingData, updateBookingData, setStepReached } = useBooking();
  const [errorMessage, setErrorMessage] = useState('');

  const priceDetails = calculateBookingPrice({
    pricePerDay: bookingData.selectedCar?.pricePerDay || 3499,
    rentalType: bookingData.rentalType,
    deliveryOption: bookingData.deliveryOption,
    pickupCity: bookingData.pickupCity,
    returnCity: bookingData.returnCity,
    pickupDate: bookingData.pickupDate,
    pickupTime: bookingData.pickupTime,
    returnDate: bookingData.returnDate,
    returnTime: bookingData.returnTime,
    vehicleSecurityDeposit: bookingData.selectedCar?.securityDeposit || 5000
  });

  const handleNext = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validate dates
    const dateCheck = validateBookingDates(
      bookingData.pickupDate,
      bookingData.pickupTime,
      bookingData.returnDate,
      bookingData.returnTime
    );

    if (!dateCheck.valid) {
      setErrorMessage(dateCheck.error || 'Please select valid travel dates.');
      return;
    }

    // 2. Check vehicle availability if a car is pre-selected
    if (bookingData.selectedCar?.id) {
      const availCheck = vehicleAvailabilityService.isVehicleAvailable(
        bookingData.selectedCar.id,
        bookingData.pickupDate,
        bookingData.pickupTime,
        bookingData.returnDate,
        bookingData.returnTime
      );
      if (!availCheck.available) {
        setErrorMessage(availCheck.reason || 'Sorry, vehicle is not available for the selected date range.');
        return;
      }
    }

    setStepReached(4);
    onNavigate('cars');
  };

  return (
    <BackgroundWrapper>
      <div className="pt-28 sm:pt-32 pb-20 bg-transparent min-h-screen text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Header */}
        <StepProgressHeader currentStep={3} highestStepReached={bookingData.highestStepReached} onNavigate={onNavigate} />

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-serif text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-400" />
            Step 3: Travel Date & Time Selection
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            Select your travel start date, time, and return schedule.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-xs font-bold text-rose-300 flex items-center gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleNext} className="space-y-8">
          
          {/* Booking Summary Box from Step 2 */}
          <div className="bg-[#0B192C]/85 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400/10 text-amber-400 rounded-2xl border border-amber-400/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Selected Route</span>
                <span className="text-sm font-black text-white">
                  {bookingData.pickupCity} → {bookingData.returnCity}
                </span>
                <span className="text-xs text-amber-400 font-bold ml-2">
                  ({bookingData.rentalType === 'self-drive' ? 'Self Drive' : 'With Driver'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Primary Traveler</span>
                <span className="text-sm font-black text-white">{bookingData.fullName || 'Valued Guest'}</span>
                <span className="text-xs text-slate-400 block">{bookingData.mobile}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('booking')}
              className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          {/* Interactive Date & Time Picker */}
          <div className="bg-[#0B192C]/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Pick Travel Dates & Duration
            </h2>

            <AvailabilityCalendar
              pickupDate={bookingData.pickupDate}
              setPickupDate={(d) => updateBookingData({ pickupDate: d })}
              pickupTime={bookingData.pickupTime}
              setPickupTime={(t) => updateBookingData({ pickupTime: t })}
              returnDate={bookingData.returnDate}
              setReturnDate={(d) => updateBookingData({ returnDate: d })}
              returnTime={bookingData.returnTime}
              setReturnTime={(t) => updateBookingData({ returnTime: t })}
            />

            {/* Price Duration Preview */}
            <div className="p-4 bg-[#060D17] border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-bold">Total Rental Duration:</span>
                <span className="text-amber-400 font-black text-sm">{priceDetails.rentalDays} Days</span>
              </div>
              <span className="text-slate-400 font-medium">Calculated based on 24-hour daily cycle</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => onNavigate('booking')}
              className="px-6 py-3.5 rounded-full bg-[#060D17] border border-slate-700 hover:bg-slate-900 text-slate-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Booking Details
            </button>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              Continue to Car Selection
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </form>
      </div>
    </div>
    </BackgroundWrapper>
  );
}
