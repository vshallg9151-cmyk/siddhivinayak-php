import React, { useState, useEffect } from 'react';
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
      <div className="pt-28 sm:pt-32 pb-24 bg-transparent min-h-screen text-slate-100 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Progress Indicator */}
          <StepProgressHeader currentStep={4} highestStepReached={bookingData.highestStepReached} onNavigate={onNavigate} />

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>Step 4 of 6 · Luxury Fleet</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Select Your Vehicle
              </h1>
              <p className="text-sm text-slate-300 mt-2 font-light">
                Curated premium vehicles for your journey from <span className="text-amber-400 font-semibold">{bookingData.pickupCity || 'Origin'}</span> to <span className="text-amber-400 font-semibold">{bookingData.returnCity || 'Destination'}</span>.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search model or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all w-52 sm:w-64"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-2.5 text-xs font-semibold text-amber-300 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    {cat === 'All' ? 'All Classes' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fleet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
                  className={`group rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0F1E36] to-[#0B1626] border-amber-400 ring-2 ring-amber-400/40 shadow-2xl shadow-amber-500/15 -translate-y-1'
                      : 'bg-[#0B1626]/85 backdrop-blur-md border-slate-800 hover:border-slate-700 hover:bg-[#0E1A2D] hover:shadow-xl'
                  }`}
                >
                  {/* Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={carImg}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-400/30 tracking-wider uppercase">
                      {car.category || 'SUV'}
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-white tracking-tight line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {car.name}
                      </h3>
                      <p className="text-xs text-slate-300 font-light mt-1.5 line-clamp-2 leading-relaxed">
                        {car.description || 'Premium sanitized vehicle with 24/7 roadside assistance.'}
                      </p>
                    </div>

                    {/* Spec Icons */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-2xl text-[11px] font-semibold text-slate-300 border border-slate-800/60">
                      <div className="flex items-center gap-1.5 justify-center">
                        <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{car.seats || 5} Seats</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center border-x border-slate-800/80">
                        <Fuel className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{carFuel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <Gauge className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{car.transmission || 'Auto'}</span>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Daily Rate</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-lg font-bold text-white">₹{car.pricePerDay || 3499}</span>
                          <span className="text-[11px] text-slate-400 font-normal">/day</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-amber-400/90 font-semibold uppercase tracking-wider block">Total Estimated</span>
                        <span className="text-xl font-serif font-bold text-amber-400">₹{priceCalc.finalPayable.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">({priceCalc.rentalDays} Days)</span>
                      </div>
                    </div>

                    {/* Select Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCar(car);
                      }}
                      className={`w-full py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onNavigate('dates')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Date & Time
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!bookingData.selectedCar}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
            >
              Continue to Summary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </BackgroundWrapper>
  );
}
