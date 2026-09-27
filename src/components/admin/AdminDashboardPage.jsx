import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, DollarSign, Package, Car, MessageSquare, Ticket, 
  Plus, Edit, Trash2, Copy, Check, Filter, Search, ShieldCheck, ArrowUpRight, Sparkles, FileText, Calendar, Wrench, X, CheckCircle, AlertTriangle
} from 'lucide-react';
import { vehicleDB } from '../../services/vehicleDatabase';
import { bookingDB } from '../../services/bookingDatabase';
import VehicleAvailabilityCalendar from '../fleet/VehicleAvailabilityCalendar';
import { TOUR_PACKAGES_DATA, MOCK_CRM_LEADS, MOCK_COUPONS } from '../../data/phase5Data';

export default function AdminDashboardPage({ onExitAdmin }) {
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'bookings' | 'packages' | 'enquiries' | 'reports'

  // Vehicles & Bookings Database State
  const [vehiclesList, setVehiclesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL');

  // Calendar Modal State
  const [calendarVehicle, setCalendarVehicle] = useState(null);

  // Add / Edit Vehicle Modal State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [vehName, setVehName] = useState('');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehCategory, setVehCategory] = useState('SUV');
  const [vehRegNumber, setVehRegNumber] = useState('');
  const [vehFuelType, setVehFuelType] = useState('Petrol');
  const [vehTransmission, setVehTransmission] = useState('Automatic');
  const [vehSeats, setVehSeats] = useState(5);
  const [vehPricePerDay, setVehPricePerDay] = useState(3999);
  const [vehLocation, setVehLocation] = useState('Surat');
  const [vehImageUrl, setVehImageUrl] = useState('');
  const [vehStatus, setVehStatus] = useState('AVAILABLE');

  const refreshVehicles = async () => {
    setVehiclesList(await vehicleDB.getVehicles());
  };

  const refreshBookings = async () => {
    setBookingsList(await bookingDB.getBookings());
  };

  useEffect(() => {
    refreshVehicles();
    refreshBookings();
  }, []);

  // Handle Save Vehicle (Add / Edit)
  const handleSaveVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vehName.trim()) return;

    const imgArray = vehImageUrl.trim() ? [vehImageUrl.trim()] : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'];

    try {
      if (editingVehicleId) {
        await vehicleDB.updateVehicle(editingVehicleId, {
          name: vehName,
          brand: vehBrand,
          model: vehModel || vehName,
          category: vehCategory,
          regNumber: vehRegNumber,
          fuelType: vehFuelType,
          transmission: vehTransmission,
          seats: Number(vehSeats),
          pricePerDay: Number(vehPricePerDay),
          location: vehLocation,
          images: imgArray,
          status: vehStatus
        });
      } else {
        await vehicleDB.addVehicle({
          name: vehName,
          brand: vehBrand,
          model: vehModel || vehName,
          category: vehCategory,
          regNumber: vehRegNumber,
          fuelType: vehFuelType,
          transmission: vehTransmission,
          seats: Number(vehSeats),
          pricePerDay: Number(vehPricePerDay),
          location: vehLocation,
          images: imgArray,
          status: vehStatus
        });
      }

      setShowVehicleModal(false);
      setEditingVehicleId(null);
      await refreshVehicles();
    } catch (err) {
      alert(err.message || 'Failed to save vehicle');
    }
  };

  const handleOpenEditVehicle = (veh) => {
    setEditingVehicleId(veh.id);
    setVehName(veh.name);
    setVehBrand(veh.brand);
    setVehModel(veh.model);
    setVehCategory(veh.category);
    setVehRegNumber(veh.regNumber);
    setVehFuelType(veh.fuelType);
    setVehTransmission(veh.transmission);
    setVehSeats(veh.seats);
    setVehPricePerDay(veh.pricePerDay);
    setVehLocation(veh.location);
    setVehImageUrl(veh.images?.[0] || veh.image || '');
    setVehStatus(veh.status);
    setShowVehicleModal(true);
  };

  const handleToggleVehicleStatus = async (vehId, nextStatus) => {
    try {
      await vehicleDB.setVehicleStatus(vehId, nextStatus);
      await refreshVehicles();
    } catch (err) {
      alert(err.message || 'Failed to update vehicle status');
    }
  };

  const handleDeleteVehicle = async (vehId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from fleet?')) return;
    try {
      await vehicleDB.deleteVehicle(vehId);
      await refreshVehicles();
    } catch (err) {
      alert(err.message || 'Failed to delete vehicle');
    }
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await bookingDB.updateBookingStatus(bookingId, newStatus);
      await refreshBookings();
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const filteredBookingsList = bookingsList.filter(b => 
    bookingFilterStatus === 'ALL' || b.bookingStatus === bookingFilterStatus
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-100">Operations Admin Portal</h1>
                <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  ADMIN ROLE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage fleet vehicles, live availability, status calendars, booking status & customer reservations
              </p>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            ← Exit Admin Portal
          </button>
        </div>

        {/* Operational Restriction Warning Box */}
        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center justify-between">
          <span>🛡️ Operational Admin Mode: System Settings & Admin Account Creation are restricted to Super Admin Owner.</span>
          <span className="font-bold uppercase text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">ADMIN ACCESS</span>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-slate-900 p-2 border border-slate-800 rounded-2xl flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'vehicles', label: `Vehicle Fleet (${vehiclesList.length})`, icon: Car },
            { key: 'bookings', label: `Platform Bookings (${bookingsList.length})`, icon: Package },
            { key: 'packages', label: 'Tour Packages', icon: Ticket },
            { key: 'enquiries', label: 'Customer Enquiries', icon: MessageSquare },
            { key: 'reports', label: 'Revenue Reports', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: VEHICLE FLEET MANAGEMENT */}
        {activeTab === 'vehicles' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-400" /> Live Vehicle Availability & Status Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage live vehicle statuses (Available ✅, Booked ❌, Maintenance 🔧, Inactive ⚫) & visual calendars</p>
              </div>

              <button
                onClick={() => {
                  setEditingVehicleId(null);
                  setVehName('');
                  setVehBrand('');
                  setVehModel('');
                  setVehCategory('SUV');
                  setVehRegNumber('');
                  setVehFuelType('Petrol');
                  setVehTransmission('Automatic');
                  setVehSeats(5);
                  setVehPricePerDay(3999);
                  setVehLocation('Surat');
                  setVehImageUrl('');
                  setVehStatus('AVAILABLE');
                  setShowVehicleModal(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Vehicle to Fleet
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiclesList.map(veh => (
                <div key={veh.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-4 flex flex-col justify-between">
                  <div className="relative">
                    <img src={veh.images[0]} alt={veh.name} className="w-full h-40 object-cover rounded-xl" />
                    
                    {/* Status Badge */}
                    <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      veh.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      veh.status === 'BOOKED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      veh.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {veh.status === 'AVAILABLE' ? 'Available ✅' : veh.status === 'BOOKED' ? 'Booked ❌' : veh.status === 'MAINTENANCE' ? 'Maintenance 🔧' : 'Inactive ⚫'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm">{veh.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{veh.regNumber} • {veh.location}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-300">
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{veh.fuelType}</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{veh.transmission}</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{veh.seats} Seats</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Daily Rate:</span>
                      <span className="text-base font-black text-amber-400">₹{veh.pricePerDay.toLocaleString()}/day</span>
                    </div>

                    {/* Live Status Control Selector */}
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={veh.status}
                        onChange={(e) => handleToggleVehicleStatus(veh.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-lg px-2 py-1 outline-none w-1/2"
                      >
                        <option value="AVAILABLE">AVAILABLE ✅</option>
                        <option value="BOOKED">BOOKED ❌</option>
                        <option value="MAINTENANCE">MAINTENANCE 🔧</option>
                        <option value="INACTIVE">INACTIVE ⚫</option>
                      </select>

                      <button
                        onClick={() => setCalendarVehicle(veh)}
                        className="w-1/2 py-1 px-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold border border-purple-500/40 flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> View Calendar
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleOpenEditVehicle(veh)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg"
                        title="Edit Vehicle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(veh.id)}
                        className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PLATFORM BOOKING MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" /> Platform Booking Database Panel
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage customer reservations, confirm or cancel bookings & update status</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Filter Status:</span>
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="ALL">All Bookings ({bookingsList.length})</option>
                  <option value="CONFIRMED">CONFIRMED ✅</option>
                  <option value="PENDING">PENDING ⏳</option>
                  <option value="CANCELLED">CANCELLED ❌</option>
                  <option value="COMPLETED">COMPLETED 🏆</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Mode / Licence</th>
                    <th className="py-3 px-4">Pickup City</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredBookingsList.map(b => (
                    <tr key={b.bookingId} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{b.bookingId}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">{b.userName}</span>
                        <span className="text-[10px] text-slate-400">{b.userPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{b.vehicleName}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-200 block text-[11px]">{b.rentalType || 'Self Drive'}</span>
                        {b.rentalType === 'Chauffeur Driven' || b.rentalType === 'chauffeur' ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                            DL Not Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-300 font-mono">
                            {b.dlNumber ? `DL: ${b.dlNumber}` : 'DL Verified ✓'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{b.pickupCity}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-amber-300">{b.pickupDate} to {b.returnDate}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">₹{b.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {b.bookingStatus !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.bookingId, 'CONFIRMED')}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold rounded"
                          >
                            Confirm
                          </button>
                        )}
                        {b.bookingStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.bookingId, 'CANCELLED')}
                            className="px-2 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold rounded"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* AVAILABILITY CALENDAR MODAL */}
      {calendarVehicle && (
        <VehicleAvailabilityCalendar
          vehicle={calendarVehicle}
          onClose={() => setCalendarVehicle(null)}
        />
      )}

      {/* ADD / EDIT VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowVehicleModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"><X className="w-5 h-5" /></button>
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase rounded-full border border-amber-500/30">FLEET MANAGEMENT</span>
              <h3 className="text-2xl font-black text-white mt-2">{editingVehicleId ? 'Edit Vehicle' : 'Add Vehicle to Fleet'}</h3>
            </div>
            
            <form onSubmit={handleSaveVehicleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Vehicle Name</label>
                <input type="text" required placeholder="e.g. Mahindra Thar LX" value={vehName} onChange={(e) => setVehName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Brand</label>
                  <input type="text" placeholder="e.g. Mahindra" value={vehBrand} onChange={(e) => setVehBrand(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Registration No.</label>
                  <input type="text" placeholder="e.g. GJ-05-ST-2026" value={vehRegNumber} onChange={(e) => setVehRegNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Category</label>
                  <select value={vehCategory} onChange={(e) => setVehCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none">
                    <option value="SUV">SUV</option>
                    <option value="Luxury SUV">Luxury SUV</option>
                    <option value="MUV">MUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Luxury Sedan">Luxury Sedan</option>
                    <option value="Luxury Van">Luxury Van</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Location City</label>
                  <input type="text" required placeholder="e.g. Surat" value={vehLocation} onChange={(e) => setVehLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Fuel Type</label>
                  <input type="text" placeholder="Petrol" value={vehFuelType} onChange={(e) => setVehFuelType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Transmission</label>
                  <input type="text" placeholder="Automatic" value={vehTransmission} onChange={(e) => setVehTransmission(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Seats</label>
                  <input type="number" value={vehSeats} onChange={(e) => setVehSeats(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Daily Price (₹)</label>
                <input type="number" required value={vehPricePerDay} onChange={(e) => setVehPricePerDay(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-amber-400 outline-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Image URL</label>
                <input type="url" placeholder="https://images.unsplash.com/..." value={vehImageUrl} onChange={(e) => setVehImageUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold text-white outline-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Status</label>
                <select value={vehStatus} onChange={(e) => setVehStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 outline-none">
                  <option value="AVAILABLE">AVAILABLE ✅</option>
                  <option value="BOOKED">BOOKED ❌</option>
                  <option value="MAINTENANCE">MAINTENANCE 🔧</option>
                  <option value="INACTIVE">INACTIVE ⚫</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4">
                <Plus className="w-4 h-4" /> Save Vehicle to Fleet
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
