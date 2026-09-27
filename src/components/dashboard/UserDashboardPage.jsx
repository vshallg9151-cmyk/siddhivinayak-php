import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Calendar, CheckCircle, Heart, Download, Share2, Trash2, Printer, Compass, Car, Sparkles, User, Award, Gift, RefreshCw, MessageSquare, AlertCircle, X, FileText } from 'lucide-react';
import BookingInvoiceModal from '../booking/BookingInvoiceModal';
import UserProfileModal from '../auth/UserProfileModal';
import { useAuth } from '../../context/AuthContext';
import { bookingDB } from '../../services/bookingDatabase';

export default function UserDashboardPage({ savedTrips = [], wishlist = [], onNavigateFleet }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history' | 'wishlist' | 'loyalty'
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);

  const refreshUserBookings = async () => {
    if (user) {
      const records = await bookingDB.getUserBookings(user.id, user.email);
      setUserBookings(records);
    }
  };

  useEffect(() => {
    refreshUserBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will release the vehicle for other travelers.')) return;
    try {
      await bookingDB.cancelBooking(bookingId);
      await refreshUserBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const upcomingBookings = userBookings.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING');
  const pastBookings = userBookings.filter(b => b.bookingStatus === 'COMPLETED' || b.bookingStatus === 'CANCELLED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* User Profile Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-100">{user?.name || 'Valued Customer'}</h1>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                  VIP Customer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">📞 {user?.mobile || '+91 98765 43210'} • ✉️ {user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={onNavigateFleet}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Car className="w-4 h-4" /> Book New Vehicle
            </button>
          </div>
        </div>

        {/* User Navigation Tabs */}
        <div className="bg-slate-900 p-2 border border-slate-800 rounded-2xl flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'upcoming', label: `Upcoming Trips (${upcomingBookings.length})`, icon: Calendar },
            { key: 'history', label: `Booking History (${pastBookings.length})`, icon: Bookmark },
            { key: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
            { key: 'loyalty', label: 'Loyalty Rewards', icon: Award }
          ].map(t => {
            const IconComp = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === t.key
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <IconComp className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: UPCOMING TRIPS */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Confirmed Upcoming Reservations
            </h3>

            {upcomingBookings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <Car className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No active upcoming trips</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Browse our live vehicle fleet to reserve a self-drive or chauffeur-driven vehicle!</p>
                <button
                  onClick={onNavigateFleet}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
                >
                  Explore Vehicles
                </button>
              </div>
            ) : (
              upcomingBookings.map(b => (
                <div key={b.bookingId} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      {b.bookingStatus} ✅
                    </span>
                    <h4 className="text-xl font-black text-white">{b.vehicleName}</h4>
                    <p className="text-xs text-slate-400">
                      🗓️ <strong className="text-amber-400">{b.pickupDate} ({b.pickupTime})</strong> to <strong className="text-amber-400">{b.returnDate} ({b.returnTime})</strong>
                    </p>
                    <p className="text-xs text-slate-400">📍 Pickup Location: <strong className="text-white">{b.pickupCity}</strong></p>
                    <p className="text-xs font-mono text-amber-400">Booking ID: {b.bookingId}</p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                    <div className="text-2xl font-black text-emerald-400 font-mono">₹{b.totalAmount?.toLocaleString()}</div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" /> Invoice
                      </button>

                      <button
                        onClick={() => handleCancelBooking(b.bookingId)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40"
                      >
                        Cancel Booking
                      </button>

                      <a
                        href={`https://wa.me/919173746558?text=Hello%20Siddhivinayak%20Tours,%20I%20have%20an%20enquiry%20regarding%20booking%20${b.bookingId}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: BOOKING HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" /> Past & Cancelled Booking History
            </h3>
            
            {pastBookings.length === 0 ? (
              <p className="text-xs text-slate-500">No past completed or cancelled bookings.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {pastBookings.map(b => (
                  <div key={b.bookingId} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{b.vehicleName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {b.bookingId} • {b.pickupDate} to {b.returnDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.bookingStatus === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {b.bookingStatus}
                      </span>
                      <span className="font-mono text-xs text-white">₹{b.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> Saved Favorites
            </h3>
            {wishlist.length === 0 ? (
              <p className="text-xs text-slate-500">Your wishlist is currently empty. Explore our fleet to save vehicles!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map(car => (
                  <div key={car.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <h4 className="font-bold text-white text-xs">{car.name}</h4>
                    <p className="text-[10px] text-amber-400">₹{car.pricePerDay}/day</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LOYALTY */}
        {activeTab === 'loyalty' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> VIP Rewards Balance
            </h3>
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 font-mono text-xs">
              <p className="text-amber-400 font-bold text-xl">450 Loyalty Points</p>
              <p className="text-slate-400 mt-1">Equivalent to ₹450 instant discount on your next road trip booking.</p>
            </div>
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {isProfileOpen && (
        <UserProfileModal
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onUpdateProfile={() => setIsProfileOpen(false)}
        />
      )}

      {/* Invoice Modal */}
      {selectedInvoiceBooking && (
        <BookingInvoiceModal
          bookingData={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}
    </div>
  );
}
