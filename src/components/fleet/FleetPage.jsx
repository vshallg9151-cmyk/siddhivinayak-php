import React, { useState, useMemo } from 'react';
import { FLEET_CARS } from '../../data/mockData';
import FleetCard from './FleetCard';
import FilterPanel from './FilterPanel';
import CompareBar from './CompareBar';
import Breadcrumb from '../common/Breadcrumb';
import VehicleBookingModal from '../booking/VehicleBookingModal';
import VehicleAvailabilityCalendar from './VehicleAvailabilityCalendar';
import { SlidersHorizontal, ArrowUpDown, Sparkles, Car } from 'lucide-react';
import { vehicleDB } from '../../services/vehicleDatabase';

export default function FleetPage({
  onNavigate,
  onViewDetails,
  onBookNow: parentOnBookNow,
  wishlist,
  onToggleWishlist,
  compareList,
  onToggleCompare,
  onRemoveFromCompare,
  onClearCompare,
  onOpenComparePage
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Cars');
  const [selectedFuelTypes, setSelectedFuelTypes] = useState([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Live Booking Modal State
  const [selectedCarForBookingModal, setSelectedCarForBookingModal] = useState(null);
  const [selectedCarForCalendarModal, setSelectedCarForCalendarModal] = useState(null);

  const [dbVehicles, setDbVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      setDbVehicles(await vehicleDB.getVehicles());
    };
    fetchVehicles();
  }, []);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Cars');
    setSelectedFuelTypes([]);
    setSelectedTransmissions([]);
    setSelectedSeats([]);
    setMaxPrice(15000);
    setSelectedCity('All');
    setSortBy('popular');
  };

  // Filter & Sort Logic
  const filteredCars = useMemo(() => {
    const mergedCars = FLEET_CARS.map(c => {
      const dbMatch = dbVehicles.find(dbc => dbc.name === c.name || dbc.id === c.id);
      return dbMatch ? { ...c, ...dbMatch, image: dbMatch.images[0] || c.image } : c;
    });

    return mergedCars.filter((car) => {
      if (searchTerm && !car.name.toLowerCase().includes(searchTerm.toLowerCase()) && !car.brand?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'All Cars' && !car.category.includes(selectedCategory) && !car.categoryTag?.includes(selectedCategory)) {
        return false;
      }
      if (car.pricePerDay > maxPrice) {
        return false;
      }
      if (selectedFuelTypes.length > 0 && !selectedFuelTypes.includes(car.fuelType)) {
        return false;
      }
      if (selectedTransmissions.length > 0 && !selectedTransmissions.includes(car.transmission)) {
        return false;
      }
      if (selectedSeats.length > 0 && !selectedSeats.includes(car.seatingLabel)) {
        return false;
      }
      if (selectedCity !== 'All' && !car.location?.includes(selectedCity) && !car.cityLocation?.includes(selectedCity)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-high') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'rating') return (b.rating || 4.9) - (a.rating || 4.9);
      return (b.reviewsCount || 100) - (a.reviewsCount || 100);
    });
  }, [searchTerm, selectedCategory, selectedFuelTypes, selectedTransmissions, selectedSeats, maxPrice, selectedCity, sortBy]);

  const handleTriggerBooking = (car) => {
    setSelectedCarForBookingModal(car);
  };

  return (
    <div className="pt-24 pb-20 bg-brand-bgLight min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Our Fleet' }]} onNavigate={onNavigate} />

        {/* Page Top Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-blue bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
              India's Premier Vehicle Rentals
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-brand-navy mt-3 tracking-tight">
              Explore Our Premium Fleet
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl font-normal">
              Choose from our well-maintained cars for self-drive and chauffeur-driven journeys across India. All vehicles include 100% transparent pricing and 24×7 support.
            </p>
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm text-xs font-bold text-slate-800">
              <ArrowUpDown className="w-4 h-4 text-brand-blue" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-brand-navy outline-none font-bold cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated (4.9+ ★)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Filter Panel + Right Cars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Panel */}
          <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}>
            <FilterPanel
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedFuelTypes={selectedFuelTypes}
              setSelectedFuelTypes={setSelectedFuelTypes}
              selectedTransmissions={selectedTransmissions}
              setSelectedTransmissions={setSelectedTransmissions}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Cars Display Grid */}
          <div className="lg:col-span-3">
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-slate-600">
                Showing <strong className="text-brand-navy">{filteredCars.length}</strong> available vehicles
              </span>
              {filteredCars.length === 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-brand-blue hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Grid */}
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <FleetCard
                    key={car.id}
                    car={car}
                    isWishlisted={wishlist.some(item => item.id === car.id)}
                    isComparing={compareList.some(item => item.id === car.id)}
                    onToggleWishlist={onToggleWishlist}
                    onToggleCompare={onToggleCompare}
                    onViewDetails={onViewDetails}
                    onBookNow={handleTriggerBooking}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-6">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No vehicles match your selected filters</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">Try adjusting your price range, seating, or city selection.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-2xl bg-brand-navy text-brand-gold font-extrabold text-xs shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Live Vehicle Booking Modal */}
      {selectedCarForBookingModal && (
        <VehicleBookingModal
          vehicle={selectedCarForBookingModal}
          onClose={() => setSelectedCarForBookingModal(null)}
          onBookingSuccess={() => setSelectedCarForBookingModal(null)}
        />
      )}

      {/* Calendar Modal */}
      {selectedCarForCalendarModal && (
        <VehicleAvailabilityCalendar
          vehicle={selectedCarForCalendarModal}
          onClose={() => setSelectedCarForCalendarModal(null)}
        />
      )}

      {/* Sticky Bottom Compare Bar */}
      <CompareBar
        compareList={compareList}
        onRemoveFromCompare={onRemoveFromCompare}
        onOpenComparePage={onOpenComparePage}
        onClearCompare={onClearCompare}
      />
    </div>
  );
}
