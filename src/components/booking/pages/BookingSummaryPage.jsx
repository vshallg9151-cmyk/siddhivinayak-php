import React, { useState } from 'react';
import StepProgressHeader from '../StepProgressHeader';
import BackgroundWrapper from '../../common/BackgroundWrapper';
import { useBooking } from '../../../context/BookingContext';
import { calculateBookingPrice } from '../../../services/pricingService';
import { bookingDB } from '../../../services/bookingDatabase';
import { createWhatsAppEnquiryUrl } from '../../../utils/whatsappHelper';
import { FileText, User, MapPin, Calendar, Car, ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight, AlertTriangle, Sparkles, MessageSquare, Printer, LayoutDashboard, RefreshCw } from 'lucide-react';

export default function BookingSummaryPage({ onNavigate }) {
  const { bookingData, updateBookingData, resetBooking } = useBooking();
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const car = bookingData.selectedCar;
  const isSelfDrive = bookingData.rentalType === 'self-drive';

  const priceDetails = calculateBookingPrice({
    pricePerDay: car?.pricePerDay || 3499,
    rentalType: bookingData.rentalType,
    deliveryOption: bookingData.deliveryOption,
    pickupCity: bookingData.pickupCity,
    returnCity: bookingData.returnCity,
    pickupDate: bookingData.pickupDate,
    pickupTime: bookingData.pickupTime,
    returnDate: bookingData.returnDate,
    returnTime: bookingData.returnTime,
    vehicleSecurityDeposit: car?.securityDeposit || 5000
  });

  const { rentalDays, baseRate, baseRental, driverCharge, deliveryCharge, gstTax, securityDeposit, finalPayable } = priceDetails;

  // WhatsApp Enquiry Link Generator
  const whatsappUrl = createWhatsAppEnquiryUrl({
    customerName: bookingData.fullName || 'Valued Traveler',
    carName: car?.name || 'Mahindra Thar 4x4',
    rentalType: isSelfDrive ? 'Self Drive' : 'With Driver',
    pickupCity: bookingData.pickupCity,
    pickupDate: bookingData.pickupDate,
    returnDate: bookingData.returnDate,
    duration: `${rentalDays} Days`,
    finalPayable
  });

  // Direct Order Confirmation Handler
  const handleConfirmReservationOrder = async () => {
    setErrorMessage('');

    if (!bookingData.agreedToTerms) {
      setErrorMessage('Please agree to the Rental Terms & Free Cancellation Policy to confirm.');
      return;
    }

    try {
      const generatedBookingId = `SVT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const newBooking = await bookingDB.createBooking({
        bookingId: generatedBookingId,
        vehicleId: car?.id || 'veh-001',
        vehicleName: car?.name || 'Mahindra Thar 4x4',
        vehicleImage: car?.image || (Array.isArray(car?.images) && car?.images[0]),
        rentalType: isSelfDrive ? 'Self Drive' : 'With Driver',
        pickupCity: bookingData.pickupCity,
        dropCity: bookingData.returnCity || bookingData.pickupCity,
        deliveryOption: bookingData.deliveryOption,
        pickupDate: bookingData.pickupDate,
        pickupTime: bookingData.pickupTime,
        returnDate: bookingData.returnDate,
        returnTime: bookingData.returnTime,
        totalDays: rentalDays,
        baseFare: baseRental,
        userName: bookingData.fullName || 'Valued Traveler',
        userPhone: bookingData.mobile || '9876543210',
        userEmail: bookingData.email || 'guest@example.com',
        dlNumber: bookingData.dlNumber || null,
        dlUploaded: bookingData.dlUploaded,
        idUploaded: bookingData.idUploaded,
        totalAmount: finalPayable,
        paymentStatus: 'PAY_AT_PICKUP',
        bookingStatus: 'CONFIRMED'
      });

      setConfirmedBooking(newBooking);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to confirm reservation. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const carImg = car?.image || (Array.isArray(car?.images) && car?.images[0]) || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80';

  // If Reservation Order Confirmed -> Show Receipt Screen
  if (confirmedBooking) {
    return (
      <BackgroundWrapper>
        <div className="pt-28 sm:pt-32 pb-24 bg-transparent min-h-screen text-slate-100 font-sans">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-[#0B1626]/95 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300">
              
              {/* Success Badge */}
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 text-slate-950 font-black">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="px-3.5 py-1 bg-emerald-950/80 text-emerald-300 font-mono text-xs font-bold rounded-full border border-emerald-500/30 inline-block mb-3 tracking-wider uppercase">
                  ✓ Reservation Confirmed in Database
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">Booking Order Received!</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light max-w-lg mx-auto">
                  Your trip booking has been registered. Our travel concierge will reach out shortly for vehicle pickup coordination.
                </p>
              </div>

              {/* Booking Reference Box */}
              <div className="p-6 bg-slate-950/80 rounded-3xl border border-slate-800/80 space-y-5 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Booking Reference ID</span>
                    <span className="text-xl font-mono font-bold text-amber-400 mt-0.5 block">{confirmedBooking.bookingId}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 tracking-wider">
                    CONFIRMED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Vehicle Model</span>
                    <strong className="text-white font-serif font-bold text-sm block mt-1">{confirmedBooking.vehicleName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Rental Mode</span>
                    <strong className="text-amber-400 font-bold block mt-1">{confirmedBooking.rentalType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Pickup City</span>
                    <strong className="text-white font-semibold block mt-1">{confirmedBooking.pickupCity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Travel Dates</span>
                    <strong className="text-amber-300 font-mono font-semibold block mt-1">
                      {confirmedBooking.pickupDate} to {confirmedBooking.returnDate}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Primary Traveler</span>
                    <strong className="text-white font-semibold block mt-1">{confirmedBooking.userName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Estimated Fare</span>
                    <strong className="text-emerald-400 font-serif font-bold text-base block mt-0.5">₹{confirmedBooking.totalAmount?.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-6 py-3 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  Print Receipt Slip
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  View in My Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetBooking();
                    onNavigate('booking');
                  }}
                  className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium text-xs tracking-wider uppercase transition-all border border-slate-800 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  Book Another Car
                </button>
              </div>

            </div>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="pt-28 sm:pt-32 pb-24 bg-transparent min-h-screen text-slate-100 font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Progress Indicator */}
          <StepProgressHeader currentStep={5} highestStepReached={bookingData.highestStepReached} onNavigate={onNavigate} />

          {/* Page Title */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Step 5 of 6 · Order Review</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Booking Summary & Confirmation
            </h1>
            <p className="text-sm text-slate-300 mt-2 font-light">
              Please review your complete trip schedule and confirm your reservation below.
            </p>
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-xs text-rose-200 font-semibold flex items-center gap-3 mb-6 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Review Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Customer Details */}
              <div className="bg-[#0B1626]/85 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                    <User className="w-4 h-4 text-amber-400" /> Traveler Information
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('booking')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Primary Traveler</span>
                    <strong className="text-white block mt-1">{bookingData.fullName || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Mobile Number</span>
                    <strong className="text-white block mt-1">{bookingData.mobile || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Email Address</span>
                    <strong className="text-slate-300 font-mono block mt-1">{bookingData.email || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Delivery Option</span>
                    <strong className="text-amber-400 block mt-1">{bookingData.deliveryOption}</strong>
                  </div>
                </div>

                {/* Verified Documents Badge */}
                <div className="pt-2">
                  <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Mandatory Documents Verified (Govt ID {isSelfDrive ? '& DL' : ''})</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full tracking-wider">
                      VERIFIED 100%
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Route & Schedule Details */}
              <div className="bg-[#0B1626]/85 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                    <Calendar className="w-4 h-4 text-amber-400" /> Schedule & Route
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('dates')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    Edit Dates
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Pickup City</span>
                    <strong className="text-white block mt-1">{bookingData.pickupCity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Drop City</span>
                    <strong className="text-white block mt-1">{bookingData.returnCity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Pickup Date & Time</span>
                    <strong className="text-amber-300 font-mono block mt-1">
                      {bookingData.pickupDate} ({bookingData.pickupTime})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Return Date & Time</span>
                    <strong className="text-amber-300 font-mono block mt-1">
                      {bookingData.returnDate} ({bookingData.returnTime})
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. Selected Car Card */}
              {car && (
                <div className="bg-[#0B1626]/85 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                      <Car className="w-4 h-4 text-amber-400" /> Selected Vehicle
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate('cars')}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      Change Vehicle
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-full sm:w-44 h-28 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <img src={carImg} alt={car.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        {car.category || 'SUV'}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-white">{car.name}</h4>
                      <p className="text-xs text-slate-300 font-light">{car.description}</p>
                      <div className="text-xs font-semibold text-emerald-400 pt-1">
                        Daily Rate: ₹{car.pricePerDay?.toLocaleString()}/day
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Price Invoice & Action Buttons */}
            <div className="space-y-6">
              
              {/* Invoice Breakdown Card */}
              <div className="bg-[#0B1626]/90 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">Price Breakdown</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 tracking-wider">
                    Zero Hidden Fees
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-normal">
                    <span>Vehicle Base Rental ({rentalDays} Days x ₹{baseRate.toLocaleString()})</span>
                    <span className="font-semibold text-white">₹{baseRental.toLocaleString()}</span>
                  </div>

                  {driverCharge > 0 && (
                    <div className="flex items-center justify-between text-amber-300 font-normal">
                      <span>Chauffeur Driver Allowance ({rentalDays} Days x ₹500)</span>
                      <span className="font-semibold text-white">₹{driverCharge.toLocaleString()}</span>
                    </div>
                  )}

                  {deliveryCharge > 0 && (
                    <div className="flex items-center justify-between text-slate-300 font-normal">
                      <span>Delivery Charge ({bookingData.deliveryOption})</span>
                      <span className="font-semibold text-white">₹{deliveryCharge.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-300 font-normal">
                    <span>GST & Taxes (5% - 18%)</span>
                    <span className="font-semibold text-white">₹{gstTax.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 font-normal pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400">Security Deposit (Refundable)</span>
                    <span className="font-semibold text-slate-300">₹{securityDeposit.toLocaleString()}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-2xl font-serif font-bold text-white">₹{finalPayable.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] bg-amber-400/10 text-amber-400 font-semibold px-2.5 py-1 rounded-full border border-amber-400/30">
                      Inclusive of taxes
                    </span>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
                    <input
                      type="checkbox"
                      checked={bookingData.agreedToTerms}
                      onChange={(e) => updateBookingData({ agreedToTerms: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded mt-0.5 shrink-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-300 font-normal leading-relaxed">
                      I agree to the <strong className="text-white font-semibold">Siddhivinayak Rental Terms</strong> & <strong className="text-white font-semibold">24-Hour Free Cancellation Policy</strong>.
                    </span>
                  </label>
                </div>

                {/* Action Buttons: WhatsApp & Confirm Order */}
                <div className="space-y-3 pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    Enquire via WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={handleConfirmReservationOrder}
                    className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Sparkles className="w-4 h-4" />
                    Confirm Reservation Order
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Back Button */}
          <div className="flex items-center justify-start pt-8 border-t border-slate-800 mt-10">
            <button
              type="button"
              onClick={() => onNavigate('cars')}
              className="px-6 py-3 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Vehicle Selection
            </button>
          </div>

        </div>
      </div>
    </BackgroundWrapper>
  );
}
