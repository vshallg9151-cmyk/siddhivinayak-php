import React, { useState, useRef, useEffect } from 'react';
import { 
  Car, MapPin, Calendar, Search, Shield, Users, Headphones, 
  User, FileText, CheckCircle2, Flag, Home, Sparkles, Mic, Sun, Moon,
  HelpCircle, ChevronDown, LayoutDashboard, ShieldCheck, Crown, LogOut, LogIn,
  Clock, Compass, ArrowRight
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { INDIAN_LANGUAGES_ONLY } from '../../data/phase7Data';

import TrustSection from '../trust/TrustSection';
import FleetSection from '../fleet/FleetSection';
import DestinationsSection from '../destinations/DestinationsSection';
import WhyChooseUs from '../features/WhyChooseUs';
import ReviewsSection from '../reviews/ReviewsSection';
import OffersSection from '../offers/OffersSection';
import AppShowcase from '../app/AppShowcase';

export default function PremiumHomepage({ 
  onNavigate, onBookNow, onOpenSupport, onOpenVoiceAI, onOpenPilgrimage 
}) {
  const { bookingData, updateBookingData } = useBooking();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Booking search bar state
  const [pickupCity, setPickupCity] = useState(bookingData.pickupCity || '');
  const [destinationCity, setDestinationCity] = useState(bookingData.returnCity || '');
  const [pickupDate, setPickupDate] = useState(bookingData.pickupDate || '');
  const [pickupTime, setPickupTime] = useState(bookingData.pickupTime || '10:00');

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    updateBookingData({
      pickupCity: pickupCity || 'Mumbai',
      returnCity: destinationCity || 'Pune',
      pickupDate: pickupDate || bookingData.pickupDate,
      pickupTime: pickupTime,
    });
    // Navigate safely to existing Trip Details page / booking flow
    onNavigate('booking');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO SECTION (Directly Matching Luxury Travel Reference UI)   */}
      {/* ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#060D17] pb-6">
        
        {/* BACKGROUND IMAGE & CINEMATIC VIGNETTE OVERLAY */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_voyara.jpg"
            alt="Siddhivinayak Luxury Travel Scenic Alpine Lake"
            className="w-full h-full object-cover object-center scale-100 filter brightness-90 transition-transform duration-1000"
          />
          {/* Subtle multi-layer cinematic vignette for editorial elegance & text clarity */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060D17] via-black/20 to-black/40" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/25 to-black/60 pointer-events-none" />
        </div>

        {/* ========================================================================= */}
        {/* 2. MINIMAL LUXURY NAVBAR (Matching VOYARA Reference)                       */}
        {/* ========================================================================= */}
        <header className="relative z-20 pt-6 px-6 sm:px-12 max-w-7xl mx-auto w-full">
          <div className="w-full flex items-center justify-between gap-6 py-2">
            
            {/* LEFT: BRAND LOGO (Clean uppercase serif like VOYARA) */}
            <button 
              onClick={() => onNavigate('home')} 
              className="text-left focus:outline-none shrink-0 cursor-pointer group"
            >
              <span className="font-serif text-lg sm:text-xl md:text-2xl tracking-[0.25em] text-white font-normal uppercase group-hover:text-amber-300 transition-colors">
                SIDDHIVINAYAK
              </span>
            </button>

            {/* CENTER: UNBOXED AIRY TEXT LINKS */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
              <button
                onClick={() => {
                  const elem = document.getElementById('destinations');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  else onNavigate('home');
                }}
                className="text-white/80 hover:text-white text-xs sm:text-sm tracking-widest uppercase transition-colors font-light cursor-pointer"
              >
                Destinations
              </button>

              <button
                onClick={() => onNavigate('fleet')}
                className="text-white/80 hover:text-white text-xs sm:text-sm tracking-widest uppercase transition-colors font-light cursor-pointer"
              >
                Fleet
              </button>

              {onOpenPilgrimage && (
                <button
                  onClick={onOpenPilgrimage}
                  className="text-white/80 hover:text-white text-xs sm:text-sm tracking-widest uppercase transition-colors font-light cursor-pointer"
                >
                  Pilgrimage
                </button>
              )}

              <button
                onClick={() => onNavigate('booking')}
                className="text-white/80 hover:text-white text-xs sm:text-sm tracking-widest uppercase transition-colors font-light cursor-pointer"
              >
                Trip Details
              </button>

              <button
                onClick={() => onNavigate('business')}
                className="text-white/80 hover:text-white text-xs sm:text-sm tracking-widest uppercase transition-colors font-light cursor-pointer"
              >
                Business
              </button>
            </nav>

            {/* RIGHT: PLAN YOUR TRIP PILL BUTTON + AUTH */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Language Switcher */}
              <div className="hidden xl:flex items-center bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1">
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-transparent text-white/90 text-xs font-light tracking-wide focus:outline-none cursor-pointer max-w-[80px]"
                >
                  {INDIAN_LANGUAGES_ONLY.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Plan Your Trip (Pill Button Matching Reference) */}
              <button
                onClick={() => onNavigate('booking')}
                className="border border-white/50 hover:bg-white hover:text-slate-950 text-white rounded-full px-5 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-sm"
              >
                Plan Your Trip
              </button>

              {/* USER PROFILE DROPDOWN / LOGIN */}
              {!user ? (
                <button
                  onClick={() => onNavigate('login')}
                  className="text-white/80 hover:text-white text-xs tracking-wider uppercase font-light px-2 py-1 transition-colors cursor-pointer"
                >
                  Login
                </button>
              ) : (
                <div className="relative shrink-0" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 px-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className="text-xs text-white max-w-[70px] truncate hidden sm:inline font-light">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/70" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-[#0B192C]/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/60">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      {user.role === 'SUPER_ADMIN' && (
                        <button
                          onClick={() => { setUserDropdownOpen(false); onNavigate('super-admin'); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                        >
                          <Crown className="w-4 h-4 text-purple-400" /> Super Admin Panel
                        </button>
                      )}

                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => { setUserDropdownOpen(false); onNavigate('admin'); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Dashboard
                        </button>
                      )}

                      {user.role === 'USER' && (
                        <button
                          onClick={() => { setUserDropdownOpen(false); onNavigate('dashboard'); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-400" /> My Dashboard
                        </button>
                      )}

                      <button
                        onClick={() => { setUserDropdownOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. HERO CENTER CONTENT (Exact Match with Reference Headline & Styling)     */}
        {/* ========================================================================= */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-6 w-full flex-grow flex flex-col justify-between items-center text-center">
          
          <div className="space-y-4 max-w-3xl">
            
            {/* Eyebrow (Matches "ELEVATE YOUR WANDERLUST" in reference) */}
            <div className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-amber-400/90 drop-shadow">
              ELEVATE YOUR WANDERLUST
            </div>

            {/* Editorial Serif Headline (Matches "Your Journey Begins Here." in reference) */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white font-normal tracking-tight leading-[1.12] drop-shadow-2xl">
              Your Journey<br />Begins Here.
            </h1>

            {/* Subheading */}
            <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed drop-shadow mt-4">
              Discover curated experiences in the world's most breathtaking destinations. Tailored exclusively for the modern explorer.
            </p>

          </div>

          {/* ========================================================================= */}
          {/* 4. FLOATING TRANSLUCENT GLASS PILL SEARCH BAR (Exact Match to Reference)   */}
          {/* ========================================================================= */}
          <div className="mt-8 sm:mt-10 w-full max-w-3xl">
            <form 
              onSubmit={handleSearchSubmit}
              className="bg-[#242c38]/70 backdrop-blur-2xl border border-white/20 rounded-full p-2 pl-6 pr-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 transition-all hover:border-white/30"
            >
              
              {/* FIELD 1: WHERE TO? / FROM */}
              <div className="flex items-center gap-3 flex-1 min-w-0 w-full px-2 py-1">
                <MapPin className="w-4 h-4 text-white/70 shrink-0" />
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="Where to?"
                  className="bg-transparent text-sm text-white focus:outline-none placeholder:text-white/60 font-light w-full truncate"
                />
              </div>

              {/* Vertical Glass Divider */}
              <div className="hidden md:block h-6 w-px bg-white/20 shrink-0" />

              {/* FIELD 2: DATE (MM/DD/YYYY) */}
              <div className="flex items-center gap-3 flex-1 min-w-0 w-full px-2 py-1">
                <Calendar className="w-4 h-4 text-white/70 shrink-0" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="bg-transparent text-sm text-white focus:outline-none placeholder:text-white/60 font-light cursor-pointer w-full"
                />
              </div>

              {/* Vertical Glass Divider */}
              <div className="hidden md:block h-6 w-px bg-white/20 shrink-0" />

              {/* FIELD 3: TRAVELERS */}
              <div className="flex items-center gap-3 flex-1 min-w-0 w-full px-2 py-1">
                <Users className="w-4 h-4 text-white/70 shrink-0" />
                <input
                  type="text"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  placeholder="Travelers"
                  className="bg-transparent text-sm text-white focus:outline-none placeholder:text-white/60 font-light w-full truncate"
                />
              </div>

              {/* SEARCH ACTION BUTTON: WARM GOLDEN PILL BUTTON (Matching Reference) */}
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-medium text-sm shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                title="Search Available Rides"
              >
                <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span className="font-semibold tracking-wide">Search</span>
              </button>

            </form>
          </div>

          {/* ========================================================================= */}
          {/* 5. BOTTOM SCROLL INDICATOR (Exact Match to Reference)                      */}
          {/* ========================================================================= */}
          <div className="pt-8 pb-2 flex flex-col items-center gap-1 text-white/70">
            <span className="text-[10px] tracking-[0.3em] uppercase font-light text-white/80">
              SCROLL
            </span>
            <span className="text-white/70 text-xs">↓</span>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. COMPLETE HOME SECTIONS (Rendered on Light Neutral Background)          */}
      {/* ========================================================================= */}
      <div className="relative z-10 bg-slate-50">
        
        {/* 1. Trust & The Siddhivinayak Promise */}
        <TrustSection />

        {/* 2. Explore Available Fleet Vehicles */}
        <FleetSection onBookNowTriggered={onBookNow} />

        {/* 3. Popular Road Trip Destinations & Circuits */}
        <DestinationsSection onTriggerAIPlanner={() => onNavigate('ubooking')} />

        {/* 4. Why Choose Us (8 Quality Pillars) */}
        <WhyChooseUs />

        {/* 5. Special Rental Offers & Coupons */}
        <OffersSection onCopyCoupon={(code) => {}} />

        {/* 6. Real Verified Customer Reviews */}
        <ReviewsSection />

        {/* 7. Mobile App Keyless Showcase */}
        <AppShowcase />

      </div>

    </div>
  );
}
