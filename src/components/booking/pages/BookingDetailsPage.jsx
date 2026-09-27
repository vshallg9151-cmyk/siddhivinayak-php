import React, { useState } from 'react';
import StepProgressHeader from '../StepProgressHeader';
import BackgroundWrapper from '../../common/BackgroundWrapper';
import RentalTypeCard from '../RentalTypeCard';
import CustomerForm from '../CustomerForm';
import DocumentUpload from '../DocumentUpload';
import { useBooking } from '../../../context/BookingContext';
import { validateIndianMobile, validateEmailAddress, validateDrivingLicenseNumber, validateGovtIdNumber } from '../../../services/govtVerificationService';
import { MapPin, Sparkles, ArrowRight, Check, AlertTriangle } from 'lucide-react';

const CITIES = [
  'Surat', 'Mumbai', 'Ahmedabad', 'Pune', 'Vadodara', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 
  'Jaipur', 'Udaipur', 'Goa', 'Indore', 'Rajkot', 'Nashik', 'Chandigarh', 'Navsari', 'Vapi'
];

export default function BookingDetailsPage({ onNavigate }) {
  const { bookingData, updateBookingData, setStepReached } = useBooking();
  const [errorMessage, setErrorMessage] = useState('');

  const isSelfDrive = bookingData.rentalType === 'self-drive';

  const handleNext = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Route Cities Validation
    if (!bookingData.pickupCity || !bookingData.returnCity) {
      setErrorMessage('Please select both Pickup Location and Drop Location.');
      return;
    }

    // 2. Customer Name Validation
    if (!bookingData.fullName || bookingData.fullName.trim().length < 2) {
      setErrorMessage('Please enter your valid Full Name (at least 2 characters).');
      return;
    }

    // 3. Mobile Number Validation
    const mobileCheck = validateIndianMobile(bookingData.mobile);
    if (!mobileCheck.valid) {
      setErrorMessage(mobileCheck.error || 'Please enter a valid 10-digit Indian Mobile Number.');
      return;
    }

    // 4. Email Validation (if provided)
    if (bookingData.email) {
      const emailCheck = await validateEmailAddress(bookingData.email);
      if (!emailCheck.valid) {
        setErrorMessage(emailCheck.error || 'Please enter a valid email address.');
        return;
      }
    }

    // 5. Driving License Validation (for Self Drive)
    if (isSelfDrive) {
      const dlCheck = validateDrivingLicenseNumber(bookingData.dlNumber);
      if (!dlCheck.valid) {
        setErrorMessage(`⚠️ Driving License Error: ${dlCheck.error}`);
        return;
      }
      if (!bookingData.dlUploaded) {
        setErrorMessage('⚠️ Mandatory: Please upload your Driving License copy & complete verification.');
        return;
      }
    }

    // 6. Govt ID Number & Document Validation
    const idCheck = validateGovtIdNumber(bookingData.idType || 'Aadhaar', bookingData.idNumber);
    if (!idCheck.valid) {
      setErrorMessage(`⚠️ Govt ID Error (${bookingData.idType || 'Aadhaar'}): ${idCheck.error}`);
      return;
    }
    if (!bookingData.idUploaded) {
      setErrorMessage(`⚠️ Mandatory: Please upload your ${bookingData.idType || 'Govt ID'} document copy & complete verification.`);
      return;
    }

    // Success -> set step reached to 3 and navigate
    setStepReached(3);
    onNavigate('dates');
  };

  return (
    <BackgroundWrapper>
      <div className="pt-28 sm:pt-32 pb-20 bg-transparent min-h-screen text-slate-100 font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Step Progress Indicator */}
          <StepProgressHeader currentStep={2} highestStepReached={bookingData.highestStepReached} onNavigate={onNavigate} />

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl font-serif text-white flex items-center gap-2">
              <MapPin className="w-7 h-7 text-amber-400" />
              Step 2: Trip Configuration & Passenger Details
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Select your rental mode, route locations, and verify customer credentials.
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
            
            {/* Primary Choice: Rental Mode Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 px-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Select Rental Mode
              </label>
              <RentalTypeCard
                rentalType={bookingData.rentalType}
                onChange={(mode) => updateBookingData({ rentalType: mode })}
              />
            </div>

            {/* Route & Delivery Options Card */}
            <div className="bg-[#0B192C]/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <h2 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Route & Delivery Options
              </h2>

              {/* Pickup & Drop Cities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Pickup Location / City *
                  </label>
                  <select
                    value={bookingData.pickupCity}
                    onChange={(e) => updateBookingData({ pickupCity: e.target.value })}
                    className="w-full bg-[#060D17] border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        📍 {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Drop Location / Destination *
                  </label>
                  <select
                    value={bookingData.returnCity}
                    onChange={(e) => updateBookingData({ returnCity: e.target.value })}
                    className="w-full bg-[#060D17] border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        🏁 {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Option */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Vehicle Pickup / Delivery Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    'Doorstep Delivery',
                    'Airport Pickup',
                    'Office Delivery',
                    'Hub Self Pick'
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateBookingData({ deliveryOption: opt })}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        bookingData.deliveryOption === opt
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-[#060D17] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {bookingData.deliveryOption === opt && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Passenger Contact Info Form */}
            <CustomerForm
              formData={bookingData}
              setFormData={(newFields) => updateBookingData(newFields)}
              rentalType={bookingData.rentalType}
            />

            {/* Real-time Verified Document Upload Form */}
            <DocumentUpload
              rentalType={bookingData.rentalType}
              dlNumber={bookingData.dlNumber}
              setDlNumber={(val) => updateBookingData({ dlNumber: val })}
              idType={bookingData.idType || 'Aadhaar'}
              setIdType={(val) => updateBookingData({ idType: val })}
              idNumber={bookingData.idNumber}
              setIdNumber={(val) => updateBookingData({ idNumber: val })}
              dlUploaded={bookingData.dlUploaded}
              setDlUploaded={(val) => updateBookingData({ dlUploaded: val })}
              idUploaded={bookingData.idUploaded}
              setIdUploaded={(val) => updateBookingData({ idUploaded: val })}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-end pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                Continue to Travel Schedule (Step 3)
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </form>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
