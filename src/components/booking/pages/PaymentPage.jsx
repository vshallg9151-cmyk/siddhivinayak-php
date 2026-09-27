import React, { useState } from 'react';
import StepProgressHeader from '../StepProgressHeader';
import BackgroundWrapper from '../../common/BackgroundWrapper';
import { useBooking } from '../../../context/BookingContext';
import { calculateBookingPrice } from '../../../services/pricingService';
import { bookingDB } from '../../../services/bookingDatabase';
import { CreditCard, ShieldCheck, Lock, CheckCircle2, QrCode, ArrowLeft, ArrowRight, Printer, Sparkles, AlertTriangle, LayoutDashboard, RefreshCw } from 'lucide-react';

export default function PaymentPage({ onNavigate }) {
  const { bookingData, resetBooking } = useBooking();
  const car = bookingData.selectedCar;

  const [paymentType, setPaymentType] = useState('full'); // 'full' | 'advance'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

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

  const totalAmount = priceDetails.finalPayable;
  const advanceAmount = Math.round(totalAmount * 0.2); // 20% advance
  const payableAmount = paymentType === 'advance' ? advanceAmount : totalAmount;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const generatedBookingId = `SVT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // Save Booking to Database
      const newBooking = await bookingDB.createBooking({
        bookingId: generatedBookingId,
        vehicleId: car?.id || 'veh-001',
        vehicleName: car?.name || 'Mahindra Thar 4x4',
        vehicleImage: car?.image,
        rentalType: bookingData.rentalType === 'self-drive' ? 'Self Drive' : 'Chauffeur Driven',
        pickupCity: bookingData.pickupCity,
        dropCity: bookingData.returnCity || bookingData.pickupCity,
        deliveryOption: bookingData.deliveryOption,
        pickupDate: bookingData.pickupDate,
        pickupTime: bookingData.pickupTime,
        returnDate: bookingData.returnDate,
        returnTime: bookingData.returnTime,
        totalDays: priceDetails.rentalDays,
        baseFare: priceDetails.baseRental,
        userName: bookingData.fullName || 'Valued Guest',
        userPhone: bookingData.mobile || '9876543210',
        userEmail: bookingData.email || 'guest@example.com',
        dlNumber: bookingData.dlNumber || null,
        dlUploaded: bookingData.dlUploaded,
        idUploaded: bookingData.idUploaded,
        totalAmount: totalAmount,
        paidAmount: payableAmount,
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED'
      });

      setConfirmedBooking(newBooking);
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // If payment succeeded -> Show Confirmation Receipt
  if (confirmedBooking) {
    return (
      <BackgroundWrapper>
        <div className="pt-28 sm:pt-32 pb-24 bg-transparent min-h-screen text-slate-100 font-sans">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-[#0B1626]/95 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-300">
              
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest inline-block mb-3">
                  Booking Confirmed & Payment Successful
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  Thank You, {confirmedBooking.userName}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-light mt-2 max-w-lg mx-auto">
                  Your reservation has been confirmed and saved to Siddhivinayak Tours database.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 text-left space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 font-sans">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking Reference ID</span>
                    <span className="text-xl font-mono font-bold text-amber-400 mt-0.5 block">{confirmedBooking.bookingId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/30 tracking-wider">
                      CONFIRMED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Vehicle</span>
                    <span className="font-serif font-bold text-white text-sm block mt-1">{confirmedBooking.vehicleName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Rental Type</span>
                    <span className="font-bold text-amber-400 block mt-1">{confirmedBooking.rentalType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Pickup Date & Time</span>
                    <span className="font-medium text-white block mt-1">{confirmedBooking.pickupDate} @ {confirmedBooking.pickupTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Return Date & Time</span>
                    <span className="font-medium text-white block mt-1">{confirmedBooking.returnDate} @ {confirmedBooking.returnTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Route</span>
                    <span className="font-medium text-white block mt-1">{confirmedBooking.pickupCity} → {confirmedBooking.dropCity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Paid Amount</span>
                    <span className="font-serif font-bold text-emerald-400 text-base block mt-0.5">₹{confirmedBooking.paidAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-6 py-3 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  Print / Save Receipt
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
                  <RefreshCw className="w-4 h-4" />
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Step Progress Header */}
          <StepProgressHeader currentStep={6} highestStepReached={bookingData.highestStepReached} onNavigate={onNavigate} />

          {/* Page Title */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Step 6 of 6 · Payment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Secure Payment Gateway
            </h1>
            <p className="text-sm text-slate-300 mt-2 font-light">
              Complete your reservation payment via bank-grade 256-bit encrypted checkout.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-xs font-semibold text-rose-200 flex items-center gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handlePayNow} className="space-y-8">
            
            {/* Payment Type Selection */}
            <div className="bg-[#0B1626]/85 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Choose Payment Amount Option
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentType('full')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    paymentType === 'full'
                      ? 'bg-amber-400/10 border-amber-400 text-white ring-2 ring-amber-400/30 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white block">100% Full Payment</span>
                    <span className="text-lg font-serif font-bold text-amber-400">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1.5 block font-light">Pay full amount now for guaranteed instant reservation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('advance')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    paymentType === 'advance'
                      ? 'bg-amber-400/10 border-amber-400 text-white ring-2 ring-amber-400/30 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white block">20% Advance Payment</span>
                    <span className="text-lg font-serif font-bold text-amber-400">₹{advanceAmount.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1.5 block font-light">Pay 20% now, balance ₹{(totalAmount - advanceAmount).toLocaleString()} at vehicle pickup</span>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-[#0B1626]/85 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'upi', label: 'UPI / QR Code', icon: QrCode },
                  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Lock },
                  { id: 'wallet', label: 'Wallets / PayLater', icon: Sparkles }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-2xl border text-xs font-semibold transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === m.id
                          ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/40'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input fields based on method */}
              {paymentMethod === 'upi' && (
                <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-3">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Enter UPI ID (GooglePay / PhonePe / Paytm)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@upi or username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name as printed on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4532 •••• •••• 8901"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">CVV Security Code</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('confirmation')}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Summary
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
              >
                {isProcessing ? 'Processing Secure Payment...' : `Pay ₹${payableAmount.toLocaleString()} & Confirm Booking`}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </form>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
