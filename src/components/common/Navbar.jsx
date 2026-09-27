import React, { useState, useEffect, useRef } from 'react';
import { DISPLAY_PHONE } from '../../utils/whatsappHelper';
import { 
  Phone, User, LogIn, LogOut, Menu, X, Car, Scale, Heart, Bell, Sun, Moon, Globe, 
  Sparkles, LayoutDashboard, ShieldCheck, Crown, HelpCircle, Compass, Mic, Award, UserCheck, ChevronDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_LANGUAGES_ONLY } from '../../data/phase7Data';

export default function Navbar({ 
  onOpenAuth, onNavigate, activePage, compareCount = 0, wishlistCount = 0, 
  onOpenSupport, onOpenVoiceAI, onOpenPilgrimage 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Base Nav Links
  const navLinks = [
    { name: 'Home', page: 'home', href: '/' },
    { name: 'Trip Details', page: 'booking', href: '#booking' },
    { name: t('navFleet'), page: 'fleet', href: '#fleet' },
    { name: 'Business Hub', page: 'business', href: '#business', badge: 'PRO' },
  ];

  // Dynamic Dashboard Link based on exact user specification
  if (user) {
    if (user.role === 'USER') {
      navLinks.push({ name: 'My Dashboard', page: 'dashboard', href: '#dashboard' });
    } else if (user.role === 'ADMIN') {
      navLinks.push({ name: 'Admin Dashboard', page: 'admin', href: '#admin', badge: 'ADMIN' });
    } else if (user.role === 'SUPER_ADMIN') {
      navLinks.push({ name: 'Super Admin Panel', page: 'super-admin', href: '#super-admin', badge: 'SUPER' });
    }
  }

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(link.page);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || activePage !== 'home'
          ? 'bg-[#0B192C]/95 backdrop-blur-xl shadow-2xl py-2.5 border-b border-white/10'
          : 'bg-gradient-to-b from-[#0B192C]/90 to-transparent backdrop-blur-sm py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group text-left shrink-0 cursor-pointer focus:outline-none">
            <span className="font-serif text-lg sm:text-xl tracking-[0.25em] text-white font-normal uppercase group-hover:text-amber-300 transition-colors">
              SIDDHIVINAYAK
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`relative px-3 py-1.5 text-xs font-semibold transition-all rounded-full flex items-center gap-1 cursor-pointer ${
                  activePage === link.page
                    ? 'text-white bg-amber-400/20 border border-amber-400/40 shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
                {link.badge && (
                  <span className={`px-1.5 py-0.2 text-[8px] font-black rounded-full uppercase ${
                    link.badge === 'SUPER' ? 'bg-purple-500 text-white' :
                    link.badge === 'ADMIN' ? 'bg-amber-500 text-slate-950' :
                    'bg-amber-500 text-slate-950'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            
            {/* Voice AI Trigger */}
            <button
              onClick={onOpenVoiceAI}
              className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1 text-xs cursor-pointer"
              title="India Voice AI Concierge"
            >
              <Mic className="w-3.5 h-3.5" /> Voice AI
            </button>

            {/* Pilgrimage & Culture Hub */}
            <button
              onClick={onOpenPilgrimage}
              className="px-2.5 py-1.5 rounded-full bg-[#060D17] border border-slate-800 text-amber-400 font-bold hover:bg-slate-900 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Pilgrimage & Culture"
            >
              🛕 Pilgrimage
            </button>

            {/* INR Currency Badge */}
            <div className="bg-[#060D17] border border-slate-800 rounded-full px-2 py-1 text-amber-400 font-black text-[10px]">
              ₹ INR
            </div>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-[#060D17] border border-slate-800 rounded-full px-2 py-1">
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer max-w-[80px] truncate"
              >
                {INDIAN_LANGUAGES_ONLY.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">{lang.name}</option>
                ))}
              </select>
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full bg-[#060D17] border border-slate-800 text-amber-400 hover:bg-slate-900 transition-colors cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Support Center */}
            <button
              onClick={onOpenSupport}
              className="p-1.5 rounded-full bg-[#060D17] border border-slate-800 text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
              title="24x7 Customer Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* AUTH / USER PROFILE LOGIC */}
            {!user ? (
              /* NOT LOGGED IN STATE -> Show Login */
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-full hover:from-amber-300 hover:to-amber-500 shadow-md transition-all flex items-center gap-1.5 ml-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </button>
            ) : (
              /* LOGGED IN STATE -> Profile & Logout Dropdown */
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 px-2.5 rounded-full border transition-all cursor-pointer ${
                    userDropdownOpen 
                      ? 'bg-slate-800 border-amber-500/50' 
                      : 'bg-[#060D17] border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                    user.role === 'SUPER_ADMIN' ? 'bg-purple-500 text-white' :
                    user.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' :
                    'bg-blue-500 text-white'
                  }`}>
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  
                  <div className="flex flex-col text-left pr-1">
                    <span className="text-xs font-bold text-slate-100 max-w-[90px] truncate leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                      user.role === 'SUPER_ADMIN' ? 'text-purple-400' :
                      user.role === 'ADMIN' ? 'text-amber-400' :
                      'text-blue-400'
                    }`}>
                      {user.role === 'SUPER_ADMIN' ? 'SUPER' : user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'}
                    </span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#0B192C] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/60">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.role} {user.isOwner ? '(Owner)' : ''}
                      </span>
                    </div>

                    {/* Role Specific Dashboard Button */}
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

                    {/* Profile Option */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (user.role === 'USER') onNavigate('dashboard');
                        else if (user.role === 'ADMIN') onNavigate('admin');
                        else if (user.role === 'SUPER_ADMIN') onNavigate('super-admin');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-amber-400" /> Profile
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    {/* Logout Option */}
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

          {/* Mobile Actions & Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenVoiceAI}
              className="p-1.5 px-2.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Mic className="w-4 h-4" /> AI Voice
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B192C]/98 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 font-medium flex items-center justify-between text-sm"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}

            <hr className="border-slate-800 my-1" />

            {/* Mobile Tool Items */}
            <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
              {/* Pilgrimage */}
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenPilgrimage && onOpenPilgrimage(); }}
                className="p-2.5 rounded-xl bg-[#060D17] border border-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🛕 Pilgrimage
              </button>

              {/* Support */}
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenSupport && onOpenSupport(); }}
                className="p-2.5 rounded-xl bg-[#060D17] border border-slate-800 text-slate-200 hover:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" /> Support 24/7
              </button>

              {/* Language Switcher */}
              <div className="flex items-center justify-between bg-[#060D17] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 col-span-2">
                <span className="text-slate-400 flex items-center gap-1.5"><Globe className="w-4 h-4 text-amber-400" /> Language:</span>
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-slate-950 text-amber-400 font-extrabold text-xs focus:outline-none rounded px-2 py-1 cursor-pointer"
                >
                  {INDIAN_LANGUAGES_ONLY.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-slate-800 my-1" />

            {/* Mobile Auth Options */}
            {!user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-[#060D17] rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">{user.role}</span>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
