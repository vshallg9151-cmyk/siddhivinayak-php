import React, { useState } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, CheckCircle, Wrench, AlertTriangle, ShieldCheck, Car } from 'lucide-react';
import { bookingDB } from '../../services/bookingDatabase';

export default function VehicleAvailabilityCalendar({ vehicle, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026

  if (!vehicle) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (7 = August)
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Fetch active bookings for this vehicle
  const [vehicleBookings, setVehicleBookings] = useState([]);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (vehicle?.id) {
        setVehicleBookings(await bookingDB.getBookingsForVehicle(vehicle.id));
      }
    };
    fetchBookings();
  }, [vehicle]);

  // Helper to check status of a specific day
  const getDayStatus = (day) => {
    if (vehicle.status === 'MAINTENANCE') {
      return { status: 'MAINTENANCE', label: 'Maintenance 🔧', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
    if (vehicle.status === 'INACTIVE') {
      return { status: 'INACTIVE', label: 'Inactive ⚫', bg: 'bg-slate-800 text-slate-500 border-slate-700' };
    }

    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    for (const b of vehicleBookings) {
      if (dayStr >= b.pickupDate && dayStr <= b.returnDate) {
        return {
          status: 'BOOKED',
          label: 'Booked ❌',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          bookingId: b.bookingId,
          userName: b.userName
        };
      }
    }

    return { status: 'AVAILABLE', label: 'Available ✅', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{vehicle.name}</h3>
            <p className="text-xs text-slate-400 font-mono">
              {vehicle.regNumber} • {vehicle.location} • ₹{vehicle.pricePerDay}/day
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {monthName} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Blank leading cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 rounded-xl bg-slate-950/40" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const info = getDayStatus(dayNum);
              return (
                <div
                  key={dayNum}
                  title={info.userName ? `Booked by ${info.userName} (${info.bookingId})` : info.label}
                  className={`h-12 rounded-xl p-1.5 border flex flex-col items-center justify-between text-xs transition-all ${info.bg}`}
                >
                  <span className="font-extrabold text-[11px]">{dayNum}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full">
                    {info.status === 'AVAILABLE' ? 'AVAIL ✅' : info.status === 'BOOKED' ? 'BOOKED ❌' : 'MAINT 🔧'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend Bar */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-around text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Booked
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance
          </span>
        </div>

      </div>
    </div>
  );
}
