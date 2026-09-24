import React, { useState } from 'react';
import StepProgressHeader from '../StepProgressHeader';
import BackgroundWrapper from '../../common/BackgroundWrapper';
import { useBooking } from '../../../context/BookingContext';
import { FLEET_CARS } from '../../../data/mockData';
import { vehicleDB } from '../../../services/vehicleDatabase';
import { calculateBookingPrice } from '../../../services/pricingService';
import { Car, Users, Fuel, Gauge, Star, Check, ArrowLeft, ArrowRight, ShieldCheck, Search, Filter } from 'lucide-react';

export default function CarSelectionPage({ onNavigate }) {
  const { bookingData, updateBookingData, selectCar, setStepReached } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [availableCars, setAvailableCars] = useState(FLEET_CARS);

  useEffect(() => {
    const fetchVehicles = async () => {
      const dbCars = await vehicleDB.getVehicles();
      if (dbCars && dbCars.length > 0) {
        setAvailableCars(dbCars);
      }
    };
    fetchVehicles();
  }, []);

  const categories = ['All', ...new Set(availableCars.map((c) => c.category).filter(Boolean))];

  const filteredCars = availableCars.filter((car) => {
    const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory;
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          car.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectCar = (car) => {
    selectCar(car);
  };

  const handleNext = () => {
    if (!bookingData.selectedCar) {
      alert('Please select a car to proceed.');
      return;
    }
    setStepReached(5);
    onNavigate('confirmation');
  };

  return (
    <BackgroundWrapper>
      <div className="pt-28 sm:pt-32 pb-20 bg-transparent min-h-screen text-slate-100 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Progress Indicator */}
          <StepProgressHeader currentStep={4} highestStepReached={bookingData.highestStepReached} onNavigate={onNavigate} />

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <Car className="w-7 h-7 text-amber-400" />
                Step 4: Vehicle Selection
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Choose your preferred car for the trip ({bookingData.pickupCity} → {bookingData.returnCity}).
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search car model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 text-xs font-bold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fleet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredCars.map((car) => {
              const isSelected = bookingData.selectedCar?.id === car.id;
              const carImg = car.image || (Array.isArray(car.images) && car.images[0]) || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80';
              const carFuel = car.fuel || car.fuelType || 'Petrol';

              const priceCalc = calculateBookingPrice({
                pricePerDay: car.pricePerDay || 3499,
                rentalType: bookingData.rentalType,
                deliveryOption: bookingData.deliveryOption,
                pickupCity: bookingData.pickupCity,
                returnCity: bookingData.returnCity,
                pickupDate: bookingData.pickupDate,
                pickupTime: bookingData.pickupTime,
                returnDate: bookingData.returnDate,
                returnTime: bookingData.returnTime,
                vehicleSecurityDeposit: car.securityDeposit || 5000
              });

              return (
                <div
                  key={car.id}
                  onClick={() => handleSelectCar(car)}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-slate-900/90 border-amber-400 ring-2 ring-amber-400/50 shadow-2xl shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={carImg}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/30">
                      {car.category || 'SUV'}
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white line-clamp-1">{car.name}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-2">
                        {car.description || 'Premium sanitized vehicle with 24/7 roadside assistance.'}
                      </p>
                    </div>

                    {/* Spec Icons */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl text-[11px] font-extrabold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>{car.seats || 5} Seats</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span>{carFuel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>{car.transmission || 'Auto'}</span>
                      </div>
                    </div>

                  {/* Price Info */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Rate</span>
                      <span className="text-sm font-black text-white">₹{car.pricePerDay || 3499}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">/day</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Total Estimated</span>
                      <span className="text-base font-black text-amber-400">₹{priceCalc.finalPayable.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-bold block">({priceCalc.rentalDays} Days)</span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCar(car);
                    }}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Vehicle Selected' : 'Select This Car'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('dates')}
            className="px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-extrabold text-xs transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Date & Time
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!bookingData.selectedCar}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
          >
            Continue to Summary & Confirmation
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
    </BackgroundWrapper>
  );
}
