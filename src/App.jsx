import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Hero from './components/hero/Hero';
import TrustSection from './components/trust/TrustSection';
import FleetSection from './components/fleet/FleetSection';
import DestinationsSection from './components/destinations/DestinationsSection';
import WhyChooseUs from './components/features/WhyChooseUs';
import ReviewsSection from './components/reviews/ReviewsSection';
import OffersSection from './components/offers/OffersSection';
import AppShowcase from './components/app/AppShowcase';
import Footer from './components/common/Footer';
import AuthModal from './components/auth/AuthModal';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ItemNotFoundPage from './components/common/ItemNotFoundPage';
import LoadingSkeleton from './components/common/LoadingSkeleton';

// Phase 2 Pages
import FleetPage from './components/fleet/FleetPage';
import CarDetailsPage from './components/details/CarDetailsPage';
import ComparePage from './components/compare/ComparePage';
import LoginPage from './components/auth/LoginPage';
import PremiumHomepage from './components/home/PremiumHomepage';

// Phase 3 Pages & WhatsApp Floating Widget
import BookingFlowPage from './components/booking/BookingFlowPage';
import FloatingWhatsApp from './components/whatsapp/FloatingWhatsApp';

// Phase 4 Contexts & Security Providers
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import FloatingAIAssistant from './components/ai/FloatingAIAssistant';

// Phase 5 Pages & Access Security Guard
import UnifiedBookingPage from './components/booking/UnifiedBookingPage';
import CustomerSupportModal from './components/support/CustomerSupportModal';
import DashboardAccessGuard from './components/common/DashboardAccessGuard';

// Phase 6 Business Management System
import BusinessManagementPage from './components/business/BusinessManagementPage';

// Phase 7 India Domestic AI Platform Components
import VoiceAIConciergeModal from './components/ai/VoiceAIConciergeModal';
import IndiaPilgrimageModal from './components/india/IndiaPilgrimageModal';
import IndiaCultureFestivalModal from './components/india/IndiaCultureFestivalModal';
import TravelInsuranceModal from './components/insurance/TravelInsuranceModal';
import SocialGamificationModal from './components/social/SocialGamificationModal';
import AIFraudAndSentimentModal from './components/admin/AIFraudAndSentimentModal';
import PricePredictionWidget from './components/pricing/PricePredictionWidget';
import AISmartSearch from './components/ai/AISmartSearch';

// Phase 8 Production Legal & Error Components
import LegalModal from './components/legal/LegalModal';
import NotFoundPage from './components/common/NotFoundPage';
import ServerErrorPage from './components/common/ServerErrorPage';

// Multi-Page Booking Flow Components & Context
import { BookingProvider, useBooking } from './context/BookingContext';
import BookingDetailsPage from './components/booking/pages/BookingDetailsPage';
import DateTimePage from './components/booking/pages/DateTimePage';
import CarSelectionPage from './components/booking/pages/CarSelectionPage';
import BookingSummaryPage from './components/booking/pages/BookingSummaryPage';
import PaymentPage from './components/booking/pages/PaymentPage';

import { FLEET_CARS } from './data/mockData';
import { vehicleDB } from './services/vehicleDatabase';

// URL Route Helper for Multi-Page Booking Flow
function getPageFromPath(path) {
  if (path.startsWith('/super-admin')) return 'super-admin';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/user') || path === '/dashboard') return 'dashboard';
  if (path === '/setup' || path === '/create-super-admin') return 'setup';
  if (path.startsWith('/details')) return 'details';
  if (path === '/booking') return 'booking';
  if (path === '/dates') return 'dates';
  if (path === '/cars') return 'cars';
  if (path === '/confirmation' || path === '/payment') return 'confirmation';
  if (path.startsWith('/details/')) return 'details';
  if (path === '/fleet') return 'fleet';
  if (path === '/login') return 'login';
  if (path === '/business') return 'business';
  if (path === '/ubooking') return 'ubooking';
  if (path === '/home' || path === '/' || path === '') return 'home';
  return 'home';
}

function getPathFromPage(page, data = null) {
  if (page === 'super-admin') return '/super-admin/dashboard';
  if (page === 'admin') return '/admin/dashboard';
  if (page === 'dashboard') return '/user/dashboard';
  if (page === 'setup') return '/setup';
  if (page === 'login') return '/login';
  if (page === 'booking') return '/booking';
  if (page === 'dates') return '/dates';
  if (page === 'cars') return '/cars';
  if (page === 'confirmation' || page === 'payment') return '/confirmation';
  if (page === 'details' && data?.id) return `/details/${data.id}`;
  if (page === 'home') return '/';
  return `/${page}`;
}

function MainAppContent() {
  const { user, requireAuth, showAuthModalNeeded, setShowAuthModalNeeded, authPromptMessage } = useAuth();
  const { bookingData } = useBooking();

  const [activePage, setActivePage] = useState(() => getPageFromPath(window.location.pathname));
  const [selectedCarForDetails, setSelectedCarForDetails] = useState(FLEET_CARS[0]);
  const [selectedRentalType, setSelectedRentalType] = useState('self-drive');
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([FLEET_CARS[0], FLEET_CARS[1]]);
  const [savedTrips, setSavedTrips] = useState([]);

  // Auth & Step Route Guard Enforcer
  useEffect(() => {
    const isStepRoute = ['booking', 'dates', 'cars', 'confirmation'].includes(activePage);
    
    if (!user || !user.emailVerified) {
      if (isStepRoute) {
        setActivePage('login');
        if (window.location.pathname !== '/login') {
          window.history.replaceState({}, '', '/login');
        }
      }
    } else {
      if (activePage === 'login') {
        setActivePage('home');
        if (window.location.pathname !== '/') {
          window.history.replaceState({}, '', '/');
        }
      } else if (isStepRoute) {
        const highest = bookingData?.highestStepReached || 1;
        if (activePage === 'dates' && highest < 3) {
          setActivePage('booking');
          window.history.replaceState({}, '', '/booking');
        } else if (activePage === 'cars' && highest < 4) {
          setActivePage('dates');
          window.history.replaceState({}, '', '/dates');
        } else if (activePage === 'confirmation' && highest < 5) {
          setActivePage('cars');
          window.history.replaceState({}, '', '/cars');
        }
      }
    }
  }, [user, activePage, bookingData?.highestStepReached]);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [voiceAIModalOpen, setVoiceAIModalOpen] = useState(false);
  const [pilgrimageModalOpen, setPilgrimageModalOpen] = useState(false);

  // Legal Modal
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  // Browser History & Path Listener with ID Parameter Resolution
  useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromPath(window.location.pathname);
      setActivePage(page);

      // Resolve Vehicle ID from URL parameters if /details/:id
      if (window.location.pathname.startsWith('/details/')) {
        const paramId = window.location.pathname.split('/details/')[1];
        if (paramId) {
          vehicleDB.getVehicles().then(dbVehicles => {
            const match = dbVehicles.find(v => v.id === paramId || v.name.toLowerCase().includes(paramId.toLowerCase())) ||
                          FLEET_CARS.find(c => c.id === paramId || c.name.toLowerCase().includes(paramId.toLowerCase()));
            if (match) {
              setSelectedCarForDetails(match);
            } else {
              setSelectedCarForDetails(null); // Triggers ItemNotFoundPage
            }
          }).catch(err => {
            const match = FLEET_CARS.find(c => c.id === paramId || c.name.toLowerCase().includes(paramId.toLowerCase()));
            setSelectedCarForDetails(match || null);
          });
        }
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleNavigate = (pageName, data = null, currentUser = null) => {
    if (data && typeof data === 'object' && data.id) {
      setSelectedCarForDetails(data);
    }

    // Protect Dashboard, Business, and Booking pages with requireAuth
    if (pageName === 'dashboard' || pageName === 'ubooking' || pageName === 'business') {
      const allowed = requireAuth(() => {
        setActivePage(pageName);
        const targetUrl = getPathFromPage(pageName, data);
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({}, '', targetUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, `Please login to access ${pageName === 'dashboard' ? 'My Dashboard' : pageName}`, currentUser);
      return;
    }

    setActivePage(pageName);
    const targetUrl = getPathFromPage(pageName, data);
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode = 'login') => {
    handleNavigate('login');
  };

  const handleOpenLegal = (tab = 'privacy') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleViewDetails = (car) => {
    requireAuth(() => {
      setSelectedCarForDetails(car);
      handleNavigate('details', car);
    }, `Please login to view details for ${car?.name || 'this vehicle'}`);
  };

  const handleBookNow = (car, options = null) => {
    requireAuth(() => {
      setSelectedCarForDetails(car);
      if (options?.rentalType || options?.rentalMode || car?.rentalType || car?.rentalMode) {
        setSelectedRentalType(options?.rentalType || options?.rentalMode || car?.rentalType || car?.rentalMode);
      }
      handleNavigate('booking', car);
    }, `Please login to book ${car?.name || 'this vehicle'}`);
  };

  const handleToggleWishlist = (car) => {
    if (!car) return;
    requireAuth(() => {
      setWishlist((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const exists = safePrev.some((item) => item && item.id === car.id);
        if (exists) {
          showToast(`Removed ${car.name} from your wishlist`, 'info');
          return safePrev.filter((item) => item && item.id !== car.id);
        } else {
          showToast(`Saved ${car.name} to your wishlist!`, 'success');
          return [...safePrev, car];
        }
      });
    }, `Please login to add ${car.name} to your wishlist`);
  };

  const handleToggleCompare = (car) => {
    if (!car) return;
    requireAuth(() => {
      setCompareList((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const exists = safePrev.some((item) => item && item.id === car.id);
        if (exists) {
          showToast(`Removed ${car.name} from comparison`, 'info');
          return safePrev.filter((item) => item && item.id !== car.id);
        } else {
          if (safePrev.length >= 3) {
            showToast('You can compare up to 3 cars at once.', 'warning');
            return safePrev;
          }
          showToast(`Added ${car.name} to comparison!`, 'success');
          return [...safePrev, car];
        }
      });
    }, `Please login to compare ${car.name}`);
  };

  const handleRemoveFromCompare = (carId) => {
    setCompareList((prev) => (Array.isArray(prev) ? prev.filter((car) => car && car.id !== carId) : []));
  };

  const handleClearCompare = () => {
    setCompareList([]);
    showToast('Comparison list cleared', 'info');
  };

  const handleAuthSuccess = (authenticatedUser, roleRedirectUrl) => {
    setAuthModalOpen(false);
    setShowAuthModalNeeded(false);
    showToast(`Welcome back ${authenticatedUser.name}!`, 'success');
    handleNavigate('home', null, authenticatedUser);
  };

  // Render Role-Restricted Protected Screens
  if (activePage === 'super-admin' || activePage === 'admin' || activePage === 'dashboard' || activePage === 'setup') {
    return (
      <DashboardAccessGuard 
        targetPage={activePage}
        requestedPath={getPathFromPage(activePage)}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        wishlist={wishlist}
      />
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-gold selection:text-brand-navy">
      
      {/* Top Navbar for internal non-homepage routes */}
      {activePage !== 'home' && (
        <Navbar
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
          onOpenSupport={() => setSupportModalOpen(true)}
          onOpenVoiceAI={() => setVoiceAIModalOpen(true)}
          onOpenPilgrimage={() => setPilgrimageModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-grow">
        {activePage === 'home' && (
          <PremiumHomepage
            onNavigate={handleNavigate}
            onBookNow={handleBookNow}
            onOpenSupport={() => setSupportModalOpen(true)}
            onOpenVoiceAI={() => setVoiceAIModalOpen(true)}
            onOpenPilgrimage={() => setPilgrimageModalOpen(true)}
          />
        )}

        {activePage === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {activePage === 'fleet' && (
          <FleetPage
            onNavigate={handleNavigate}
            onViewDetails={handleViewDetails}
            onBookNow={handleBookNow}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onOpenComparePage={() => handleNavigate('compare')}
          />
        )}

        {activePage === 'details' && (
          selectedCarForDetails ? (
            <CarDetailsPage
              car={selectedCarForDetails}
              onNavigate={handleNavigate}
              onViewDetails={handleViewDetails}
              onBookNow={handleBookNow}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
            />
          ) : (
            <ItemNotFoundPage
              title="Vehicle Not Found"
              message="The requested vehicle details could not be found or may have been removed from our fleet."
              onNavigate={handleNavigate}
            />
          )
        )}

        {activePage === 'compare' && (
          <ComparePage
            compareList={compareList}
            onNavigate={handleNavigate}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onBookNow={handleBookNow}
          />
        )}

        {activePage === 'booking' && (
          <BookingDetailsPage
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'dates' && (
          <DateTimePage
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'cars' && (
          <CarSelectionPage
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'confirmation' && (
          <BookingSummaryPage
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'payment' && (
          <PaymentPage
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'ubooking' && (
          <UnifiedBookingPage
            onCompleteBooking={() => handleNavigate('dashboard')}
          />
        )}

        {activePage === 'business' && (
          <BusinessManagementPage
            onExit={() => handleNavigate('home')}
          />
        )}

        {activePage === '404' && <NotFoundPage onNavigate={handleNavigate} />}
        {activePage === '500' && <ServerErrorPage onNavigate={handleNavigate} />}
      </main>

      {/* AI Assistant & WhatsApp Floating Widgets */}
      <FloatingAIAssistant onOpenAI={() => setSupportModalOpen(true)} />
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenLegal={handleOpenLegal} />

      {/* Auth Modal Triggered Manually OR by Login Gate */}
      {(authModalOpen || showAuthModalNeeded) && (
        <AuthModal
          initialMode={authMode}
          onClose={() => { setAuthModalOpen(false); setShowAuthModalNeeded(false); }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Customer Support Modal */}
      <CustomerSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* Voice AI Concierge Modal */}
      <VoiceAIConciergeModal
        isOpen={voiceAIModalOpen}
        onClose={() => setVoiceAIModalOpen(false)}
        onOpenPlanner={() => handleNavigate('ubooking')}
        onNavigateFleet={() => handleNavigate('fleet')}
      />

      {/* Pilgrimage & Cultural Yatra Modal */}
      <IndiaPilgrimageModal
        isOpen={pilgrimageModalOpen}
        onClose={() => setPilgrimageModalOpen(false)}
        onOpenPlanner={() => handleNavigate('ubooking')}
      />

      {/* Global Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BookingProvider>
              <MainAppContent />
            </BookingProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
