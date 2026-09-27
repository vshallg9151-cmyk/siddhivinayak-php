import React from 'react';
import { Users, Fuel, Gauge, Star, Sparkles, Heart, Scale, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FleetCard({
  car,
  isWishlisted = false,
  isComparing = false,
  onToggleWishlist,
  onToggleCompare,
  onViewDetails,
  onBookNow
}) {
  const { user, requireAuth } = useAuth();
  const isAuthenticated = user && user.emailVerified && user.mobileVerified;

  const handleProtectedAction = (actionCallback, promptMsg) => {
    requireAuth(actionCallback, promptMsg);
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-luxury hover:border-amber-400/50 transition-all duration-500 flex flex-col justify-between hover:-translate-y-1.5 relative">
      
      {/* Top Action Overlay Icons */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            handleProtectedAction(() => onToggleWishlist(car), `Please login to save ${car.name} to your wishlist`); 
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/85 hover:bg-white text-slate-700 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Compare Badge Overlay */}
      <div className="absolute top-3 left-3 z-20">
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            handleProtectedAction(() => onToggleCompare(car), `Please login to compare ${car.name}`); 
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer ${
            isComparing
              ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/50'
              : 'bg-slate-950/75 hover:bg-slate-950 text-slate-200 border border-white/20'
          }`}
        >
          <Scale className="w-3 h-3" />
          <span>{isComparing ? 'Comparing ✓' : '+ Compare'}</span>
        </button>
      </div>

      {/* Media & Zoom Effect */}
      <div
        onClick={() => handleProtectedAction(() => onViewDetails(car), `Please login to view full details for ${car.name}`)}
        className="relative h-60 w-full overflow-hidden bg-slate-900 cursor-pointer"
      >
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        
        {/* Category Badge & Availability */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <span className="text-[10px] uppercase font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-sm">
            {car.category || 'SUV'}
          </span>

          {isAuthenticated ? (
            <span className="text-[11px] font-bold bg-emerald-500/90 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              {car.availableStatus || 'Available Now'}
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-slate-950/90 backdrop-blur-md text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" /> Login Required
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              onClick={() => handleProtectedAction(() => onViewDetails(car), `Please login to view full details for ${car.name}`)}
              className="text-xl font-serif font-bold text-brand-navy group-hover:text-amber-600 transition-colors cursor-pointer"
            >
              {car.name}
            </h3>
          </div>

          {/* Specifications: Hidden without Login */}
          {isAuthenticated ? (
            <>
              <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-4">
                {car.tagline || 'Premium self-drive vehicle available across major Indian cities.'}
              </p>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <Users className="w-4 h-4 text-amber-600 mb-0.5" />
                  <span className="text-[11px] font-bold text-slate-800">{car.seats} Seats</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-x border-slate-200">
                  <Gauge className="w-4 h-4 text-amber-600 mb-0.5" />
                  <span className="text-[11px] font-bold text-slate-800">{car.transmission}</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <Fuel className="w-4 h-4 text-amber-600 mb-0.5" />
                  <span className="text-[11px] font-bold text-slate-800">{car.fuelType}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="my-4 p-3 bg-amber-50/80 rounded-2xl border border-amber-200/70 text-center">
              <span className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Login to View Price & Specifications
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div>
          {isAuthenticated ? (
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Starts From</span>
                <span className="text-2xl sm:text-3xl font-black text-brand-navy">
                  ₹{car.pricePerDay?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-slate-500"> / day</span>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleProtectedAction(() => onViewDetails(car), `Please login to view details for ${car.name}`)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 hover:border-brand-navy text-brand-navy font-bold text-xs hover:bg-slate-100 transition-all text-center cursor-pointer"
            >
              View Details
            </button>
            <button
              onClick={() => handleProtectedAction(() => onBookNow(car), `Please login to book ${car.name}`)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 group/btn cursor-pointer"
            >
              <span>{isAuthenticated ? 'Book Now' : '🔒 Login to Book'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
