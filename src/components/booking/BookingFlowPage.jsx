import React, { useState, useEffect } from 'react';
import BookingStepper from './BookingStepper';
import RentalTypeCard from './RentalTypeCard';
import AvailabilityCalendar from './AvailabilityCalendar';
import CustomerForm from './CustomerForm';
import DocumentUpload from './DocumentUpload';
import BookingConfirmation from './BookingConfirmation';
import EmergencySupportCard from '../common/EmergencySupportCard';
import Breadcrumb from '../common/Breadcrumb';
import { DISPLAY_PHONE, createWhatsAppEnquiryUrl } from '../../utils/whatsappHelper';
import { Users, Fuel, Gauge, Star, ShieldCheck, MapPin, Calendar, Clock, Truck, ArrowRight, ArrowLeft, MessageSquare, Tag, Check, Sparkles, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { FLEET_CARS } from '../../data/mockData';
import { vehicleAvailabilityService } from '../../services/vehicleAvailabilityService';
import { calculateBookingPrice, validateBookingDates } from '../../services/pricingService';
import { bookingDB } from '../../services/bookingDatabase';
import { validateIndianMobile } from '../../services/smsGateway';
import { validateEmailAddress } from '../../services/emailService';

export default function BookingFlowPage({ car: propCar, initialRentalType, onNavigate, onCompleteBooking }) {
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

  const car = propCar || FLEET_CARS[0];
  const [currentStep, setCurrentStep] = useState(1);

  // Booking Form State
  const [rentalType, setRentalType] = useState(propCar?.rentalType || initialRentalType || 'self-drive'); // 'self-drive' or 'chauffeur'
  const [pickupCity, setPickupCity] = useState('Mumbai');
  const [returnCity, setReturnCity] = useState('Mumbai');
  const [deliveryOption, setDeliveryOption] = useState('Doorstep Delivery'); // 'Doorstep Delivery' | 'Airport Pickup' | 'Office Delivery' | 'Hub Self Pick'
  const [pickupDate, setPickupDate] = useState(defaultDates.pickup);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState(defaultDates.returnD);
  const [returnTime, setReturnTime] = useState('18:00');

  // Customer State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    city: 'Mumbai',
    dlNumber: '',
    dlExpiryDate: '',
    preferredContact: 'WhatsApp',
    specialRequirements: ''
  });

  // Verification Upload State
  const [dlUploaded, setDlUploaded] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [hasSubmittedError, setHasSubmittedError] = useState(false);
  const [docErrorMessage, setDocErrorMessage] = useState('');

  // Terms Agreement & Concurrency State
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);
  const [availabilityWarning, setAvailabilityWarning] = useState('');

  const isSelfDrive = rentalType === 'self-drive';

  // Live Authoritative Pricing Calculation Engine
  const priceDetails = calculateBookingPrice({
    pricePerDay: car?.pricePerDay || 3499,
    rentalType: isSelfDrive ? 'self-drive' : 'chauffeur',
    deliveryOption,
    pickupCity,
    returnCity,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    vehicleSecurityDeposit: car?.securityDeposit || 5000
  });

  const { rentalDays, baseRate, baseRental, driverCharge, deliveryCharge, gstTax, securityDeposit, finalPayable } = priceDetails;

  // Check live availability on vehicle or dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (car?.id) {
        const avail = await vehicleAvailabilityService.isVehicleAvailable(
          car.id,
          pickupDate,
          pickupTime,
          returnDate,
          returnTime
        );
        if (!avail.available && avail.reason !== 'Vehicle not found.') {
          setAvailabilityWarning(avail.reason || 'Sorry, this vehicle is no longer available for the selected dates.');
        } else {
          setAvailabilityWarning('');
        }
      }
    };
    checkAvailability();
  }, [car, pickupDate, pickupTime, returnDate, returnTime]);

  const steps = [
    { id: 1, title: 'Vehicle Specs' },
    { id: 2, title: 'Rental Mode' },
    { id: 3, title: 'Trip & Dates' },
    { id: 4, title: 'Customer & Docs' },
    { id: 5, title: 'Price Summary' },
    { id: 6, title: 'Confirmation' },
  ];

  const handleNextStep = async () => {
    setDocErrorMessage('');
    setHasSubmittedError(false);

    // Step 3 Validation: Trip Dates & Times
    if (currentStep === 3) {
      const dateCheck = validateBookingDates(pickupDate, pickupTime, returnDate, returnTime);
      if (!dateCheck.valid) {
        setHasSubmittedError(true);
        setDocErrorMessage(dateCheck.error);
        return;
      }
      // Re-verify availability
      const availCheck = await vehicleAvailabilityService.isVehicleAvailable(car.id, pickupDate, pickupTime, returnDate, returnTime);
      if (!availCheck.available) {
        setHasSubmittedError(true);
        setDocErrorMessage(availCheck.reason || 'Sorry, this vehicle is no longer available for the selected dates.');
        return;
      }
    }

    // Step 4 Validation: Customer Details & Documents
    if (currentStep === 4) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        setHasSubmittedError(true);
        setDocErrorMessage('Please enter your valid Full Name (at least 2 characters).');
        window.scrollTo({ top: 400, behavior: 'smooth' });
        return;
      }

      const mobileCheck = validateIndianMobile(formData.mobile);
      if (!mobileCheck.valid) {
        setHasSubmittedError(true);
        setDocErrorMessage(mobileCheck.error);
        window.scrollTo({ top: 400, behavior: 'smooth' });
        return;
      }

      if (formData.email) {
        const emailCheck = await validateEmailAddress(formData.email);
        if (!emailCheck.valid) {
          setHasSubmittedError(true);
          setDocErrorMessage(emailCheck.error);
          window.scrollTo({ top: 400, behavior: 'smooth' });
          return;
        }
      }

      // Self Drive: Mandatory Driving Licence Number & Upload
      if (isSelfDrive) {
        if (!formData.dlNumber?.trim() || formData.dlNumber.trim().length < 5) {
          setHasSubmittedError(true);
          setDocErrorMessage('Please enter your valid Driving License Number (DL).');
          window.scrollTo({ top: 400, behavior: 'smooth' });
          return;
        }
        if (!dlUploaded) {
          setHasSubmittedError(true);
          setDocErrorMessage('⚠️ MANDATORY: Please upload your Driving License (Front & Back) before proceeding.');
          window.scrollTo({ top: 500, behavior: 'smooth' });
          return;
        }
      }

      // Govt ID Proof check
      if (!idUploaded) {
        setHasSubmittedError(true);
        setDocErrorMessage('⚠️ MANDATORY: Please upload your Govt ID Proof (Aadhaar / Voter ID / Passport) to proceed.');
        window.scrollTo({ top: 500, behavior: 'smooth' });
        return;
      }
    }

    // Step 5 Validation: Terms Agreement Check before confirmation
    if (currentStep === 5) {
      if (!agreedToTerms) {
        setHasSubmittedError(true);
        setDocErrorMessage('Please agree to the Rental Terms & 24-Hour Free Cancellation Policy to confirm.');
        return;
      }
    }

    setHasSubmittedError(false);
    setDocErrorMessage('');

    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Authoritative Final Booking Submission
  const handleFinalBookingSubmit = async () => {
    if (isBookingSubmitting) return; // Prevent double submission
    setIsBookingSubmitting(true);
    setDocErrorMessage('');

    try {
      if (!agreedToTerms) {
        throw new Error('Please agree to the rental terms and conditions.');
      }

      // Live Concurrency Check
      const liveCheck = await vehicleAvailabilityService.isVehicleAvailable(
        car.id,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime
      );

      if (!liveCheck.available) {
        throw new Error('Sorry, this vehicle is no longer available for the selected dates.');
      }

      const generatedBookingId = `SVT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // Atomic Backend Booking Record Creation
      const createdBooking = await bookingDB.createBooking({
        bookingId: generatedBookingId,
        vehicleId: car.id,
        vehicleName: car.name,
        vehicleImage: car.image,
        rentalType: isSelfDrive ? 'Self Drive' : 'Chauffeur Driven',
        pickupCity,
        dropCity: returnCity || pickupCity,
        deliveryOption,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
        totalDays: rentalDays,
        baseFare: baseRental,
        userName: formData.fullName || 'Valued Traveler',
        userPhone: formData.mobile || '9876543210',
        userEmail: formData.email || 'traveler@example.com',
        ...(isSelfDrive ? { dlNumber: formData.dlNumber, dlUploaded: true } : { dlNumber: null, dlUploaded: false }),
        idUploaded: true,
        totalAmount: finalPayable,
        paymentStatus: 'PAID'
      });

      setConfirmedBookingData(createdBooking);
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (onCompleteBooking) {
        onCompleteBooking(createdBooking);
      }

    } catch (err) {
      setHasSubmittedError(true);
      setDocErrorMessage(err.message || 'Failed to confirm reservation. Please try again.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const whatsappEnquiryUrl = createWhatsAppEnquiryUrl({
    customerName: formData.fullName || 'Valued Traveler',
    carName: car?.name || 'Mahindra Thar 4x4',
    rentalType: isSelfDrive ? 'Self Drive' : 'Chauffeur Driven',
    pickupCity,
    pickupDate,
    returnDate,
    duration: `${rentalDays} Days`,
    finalPayable
  });

  return (
    <div className="pt-24 pb-20 bg-brand-bgLight min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Our Fleet', page: 'fleet' },
            { label: car?.name || 'Vehicle', page: 'details', data: car },
            { label: `Booking Step ${currentStep}` }
          ]}
          onNavigate={onNavigate}
        />

        {/* Stepper Header */}
        <BookingStepper
          currentStep={currentStep}
          steps={steps}
          onStepClick={(s) => {
            const docsMissing = isSelfDrive ? (!dlUploaded || !idUploaded) : !idUploaded;
            if (s > 4 && docsMissing) {
              setHasSubmittedError(true);
              setDocErrorMessage(
                isSelfDrive
                  ? '⚠️ Documents Required: Upload Driving License & Govt ID Proof first!'
                  : '⚠️ Document Required: Upload Govt ID Proof first!'
              );
              return;
            }
            setCurrentStep(s);
          }}
        />

        {/* Global Error Banner */}
        {docErrorMessage && (
          <div className="mb-6 p-4 bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{docErrorMessage}</span>
          </div>
        )}

        {/* Availability Warning Banner */}
        {availabilityWarning && currentStep <= 5 && (
          <div className="mb-6 p-4 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-slate-950" />
            <span>{availabilityWarning}</span>
          </div>
        )}

        {/* STEP 1: Select Vehicle */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200">
                <img src={car?.image} alt={car?.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-brand-navy/90 backdrop-blur-md text-brand-gold text-xs font-bold px-3 py-1 rounded-full border border-brand-gold/30">
                  {car?.category}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md w-max">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{car?.rating} rating ({car?.reviewsCount} verified reviews)</span>
                </div>

                <h2 className="text-3xl font-black text-brand-navy">{car?.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{car?.tagline}</p>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Capacity</span>
                    <span className="text-xs font-bold text-slate-900">{car?.seats} Seats</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Gearbox</span>
                    <span className="text-xs font-bold text-slate-900">{car?.transmission}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Fuel</span>
                    <span className="text-xs font-bold text-slate-900">{car?.fuelType}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">Daily Base Rate</span>
                    <span className="text-3xl font-black text-brand-navy">₹{car?.pricePerDay?.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-slate-500"> / day</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    Zero Hidden Charges
                  </span>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-2xl bg-brand-blue hover:bg-blue-700 text-white font-black text-xs shadow-luxury transition-all flex items-center gap-2"
              >
                <span>Continue to Rental Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Rental Type Selection */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto mb-4">
              <h2 className="text-2xl font-black text-brand-navy">Choose How You Want to Travel</h2>
              <p className="text-xs text-slate-500 font-medium">Select Self-Drive for total driving independence, or Chauffeur-driven for VIP relaxation.</p>
            </div>

            <RentalTypeCard
              selectedType={rentalType}
              onChangeType={(t) => setRentalType(t)}
            />

            <div className="flex items-center justify-between pt-6">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Back
              </button>

              <button
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-2xl bg-brand-blue hover:bg-blue-700 text-white font-black text-xs shadow-luxury transition-all flex items-center gap-2"
              >
                <span>Continue to Trip Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Trip Details & Availability Calendar */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup & Delivery Inputs */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-brand-navy border-b border-slate-100 pb-3">
                  Pickup & Delivery Location
                </h3>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Pickup City</label>
                  <select
                    value={pickupCity}
                    onChange={(e) => {
                      setPickupCity(e.target.value);
                      if (returnCity === pickupCity) setReturnCity(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="Mumbai">Mumbai (Maharashtra)</option>
                    <option value="Surat">Surat (Gujarat)</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Pune">Pune (Maharashtra)</option>
                    <option value="Goa">Goa (Airport / Beach Hub)</option>
                    <option value="Jaipur">Jaipur (Rajasthan)</option>
                    <option value="Bengaluru">Bengaluru (Karnataka)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Return City (One-Way Supported)</label>
                  <select
                    value={returnCity}
                    onChange={(e) => setReturnCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="Mumbai">Mumbai (Maharashtra)</option>
                    <option value="Surat">Surat (Gujarat)</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Pune">Pune (Maharashtra)</option>
                    <option value="Goa">Goa (Airport / Beach Hub)</option>
                    <option value="Jaipur">Jaipur (Rajasthan)</option>
                    <option value="Bengaluru">Bengaluru (Karnataka)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Doorstep Delivery', 'Airport Pickup', 'Office Delivery', 'Hub Self Pick'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDeliveryOption(method)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          deliveryOption === method
                            ? 'bg-brand-navy text-brand-gold border-brand-navy shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onClick={(e) => { try { if (e.target.showPicker) e.target.showPicker(); } catch {} }}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Return Date</label>
                    <input
                      type="date"
                      value={returnDate}
                      min={pickupDate || new Date().toISOString().split('T')[0]}
                      onClick={(e) => { try { if (e.target.showPicker) e.target.showPicker(); } catch {} }}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Return Time</label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Availability Calendar */}
              <AvailabilityCalendar
                selectedDate={pickupDate}
                onSelectDate={(d) => setPickupDate(d)}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Back
              </button>

              <button
                onClick={handleNextStep}
                disabled={!!availabilityWarning}
                className={`px-8 py-3.5 rounded-2xl font-black text-xs shadow-luxury transition-all flex items-center gap-2 ${
                  availabilityWarning
                    ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                    : 'bg-brand-blue hover:bg-blue-700 text-white'
                }`}
              >
                <span>Continue to Customer Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 4: Customer Details & Mandatory Document Upload UI */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <CustomerForm
              formData={formData}
              setFormData={setFormData}
              rentalType={rentalType}
            />
            <DocumentUpload
              dlUploaded={dlUploaded}
              setDlUploaded={setDlUploaded}
              idUploaded={idUploaded}
              setIdUploaded={setIdUploaded}
              hasSubmittedError={hasSubmittedError}
              rentalType={rentalType}
            />

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Back
              </button>

              <button
                onClick={handleNextStep}
                className={`px-8 py-3.5 rounded-2xl font-black text-xs shadow-luxury transition-all flex items-center gap-2 ${
                  (isSelfDrive ? (dlUploaded && idUploaded) : idUploaded)
                    ? 'bg-brand-blue hover:bg-blue-700 text-white'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                <span>Continue to Price Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Transparent Price Summary & Policy Agreement */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-luxury space-y-6">
              
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Transparent Price Breakdown
                  </span>
                  <h3 className="text-xl font-black text-brand-navy mt-1">Order Summary & Guarantee</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ Zero Hidden Charges
                </span>
              </div>

              {/* Verified Documents Badge Banner */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isSelfDrive
                      ? 'Mandatory Documents Verified: Driving License & Govt ID Proof (Approved)'
                      : 'Mandatory Documents Verified: Govt ID Proof (Approved)'}
                  </span>
                </span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md uppercase font-black">
                  Verified 100%
                </span>
              </div>

              {/* Summary Table */}
              <div className="space-y-3 text-xs font-medium text-slate-700">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span>Vehicle Base Rental ({rentalDays} Days x ₹{baseRate.toLocaleString('en-IN')})</span>
                  <span className="font-bold text-slate-900">₹{baseRental.toLocaleString('en-IN')}</span>
                </div>

                {rentalType === 'chauffeur' && (
                  <div className="flex justify-between py-2 border-b border-slate-100 text-amber-700">
                    <span>Chauffeur Driver Allowance ({rentalDays} Days x ₹500)</span>
                    <span className="font-bold">+ ₹{driverCharge.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span>Delivery / Pickup Method ({deliveryOption})</span>
                  <span className="font-bold text-slate-900">₹{deliveryCharge}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span>Government GST (5%)</span>
                  <span className="font-bold text-slate-900">₹{gstTax.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Refundable Security Deposit (Paid at vehicle pickup & 100% refunded)
                  </span>
                  <span className="font-bold text-slate-900">₹{securityDeposit.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-baseline justify-between pt-4 text-slate-900">
                  <span className="text-sm font-black">Total Payable Rental Amount</span>
                  <span className="text-3xl font-black text-brand-navy">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Terms & Cancellation Agreement Checkbox */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-brand-navy rounded border-slate-300 focus:ring-brand-blue"
                  />
                  <span>
                    I agree to Siddhivinayak Tours & Travels Rental Terms, Zero Hidden Charges Guarantee, and Free Cancellation up to 24 hours prior to vehicle pickup.
                  </span>
                </label>
              </div>

              {/* Action WhatsApp & Direct Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <a
                  href={whatsappEnquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Send Enquiry via WhatsApp ({DISPLAY_PHONE})</span>
                </a>

                <button
                  type="button"
                  disabled={isBookingSubmitting || !agreedToTerms || !!availabilityWarning}
                  onClick={handleFinalBookingSubmit}
                  className={`py-4 px-6 rounded-2xl font-black text-xs shadow-luxury-gold transition-all flex items-center justify-center gap-2 ${
                    isBookingSubmitting || !agreedToTerms || availabilityWarning
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-brand-gold via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-brand-navy hover:scale-[1.01]'
                  }`}
                >
                  {isBookingSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Securing Vehicle Reservation...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm Reservation Order</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation Receipt & Status Tracker */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <BookingConfirmation
              bookingData={confirmedBookingData || {
                bookingId: `SVT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
                car,
                rentalType: isSelfDrive ? 'Self Drive' : 'Chauffeur Driven',
                pickupCity,
                pickupDate,
                returnDate,
                rentalDays,
                customerName: formData.fullName || 'Valued Traveler',
                customerPhone: formData.mobile || '9876543210',
                ...(isSelfDrive ? { dlNumber: formData.dlNumber, dlUploaded: true } : {}),
                idUploaded: true,
                finalPayable
              }}
              onNavigateHome={() => onNavigate('home')}
            />
          </div>
        )}

        {/* Dedicated Emergency Support Card below steps */}
        {currentStep < 6 && (
          <div className="mt-12">
            <EmergencySupportCard carName={car?.name} />
          </div>
        )}

      </div>
    </div>
  );
}
