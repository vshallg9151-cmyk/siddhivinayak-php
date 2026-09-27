import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { bookingDB } from '../../services/bookingDatabase';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AvailabilityCalendar({
  pickupDate = '2026-09-10',
  setPickupDate = () => {},
  pickupTime = '10:00 AM',
  setPickupTime = () => {},
  returnDate = '2026-09-12',
  setReturnDate = () => {},
  returnTime = '06:00 PM',
  setReturnTime = () => {},
  selectedCarId = null
}) {
  // Current view month & year (Default to September 2026)
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonthIndex, setViewMonthIndex] = useState(8); // 8 = September

  // Active bookings from database
  const [activeBookings, setActiveBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const allBookings = await bookingDB.getBookings() || [];
        // Filter only CONFIRMED or PENDING active reservations
        const active = allBookings.filter(
          (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PAID' || b.bookingStatus === 'PENDING'
        );
        setActiveBookings(active);
      } catch (err) {
        setActiveBookings([]);
      }
    };
    fetchBookings();
  }, []);

  const handlePrevMonth = () => {
    if (viewMonthIndex === 0) {
      setViewMonthIndex(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonthIndex(viewMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewMonthIndex(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonthIndex(viewMonthIndex + 1);
    }
  };

  // Generate Days Matrix for current view month
  const totalDaysInMonth = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonthIndex, 1).getDay(); // 0 = Sun

  const daysList = [];
  // Empty padding slots for days before 1st of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysList.push(null);
  }
  // Days 1..N
  for (let day = 1; day <= totalDaysInMonth; day++) {
    daysList.push(day);
  }

  const formatPad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const currentMonthFormatted = `${MONTH_NAMES[viewMonthIndex]} ${viewYear}`;

  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDateStr = `${viewYear}-${formatPad(viewMonthIndex + 1)}-${formatPad(day)}`;

    // Set pickup date
    setPickupDate(clickedDateStr);

    // Auto set return date to +2 days if return date is before pickup
    if (!returnDate || returnDate <= clickedDateStr) {
      const nextDate = new Date(viewYear, viewMonthIndex, day + 2);
      const nextYr = nextDate.getFullYear();
      const nextMo = formatPad(nextDate.getMonth() + 1);
      const nextDy = formatPad(nextDate.getDate());
      setReturnDate(`${nextYr}-${nextMo}-${nextDy}`);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
      
      {/* Calendar Header with Month Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-extrabold text-sm text-white">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span>Vehicle Availability Schedule</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 transition-all border border-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-amber-400 min-w-[110px] text-center">
            {currentMonthFormatted}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 transition-all border border-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date & Time Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Pickup Date & Time *
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500 shrink-0"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Return Date & Time *
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 outline-none focus:ring-2 focus:ring-amber-500 shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Status Legend */}
      <div className="flex items-center justify-around gap-2 p-2.5 bg-slate-950 rounded-2xl text-[11px] font-bold text-slate-300 border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Green: Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Yellow: Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Red: Booked in Database</span>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="text-[10px] font-extrabold uppercase text-slate-400 pb-1">
            {d}
          </span>
        ))}

        {daysList.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="p-2" />;
          }

          const dayDateStr = `${viewYear}-${formatPad(viewMonthIndex + 1)}-${formatPad(day)}`;

          // Check if this date has an active booking in the database
          const bookingMatch = activeBookings.find((b) => {
            if (selectedCarId && b.vehicleId !== selectedCarId) return false;
            return b.pickupDate <= dayDateStr && dayDateStr <= b.returnDate;
          });

          let status = 'available';
          if (bookingMatch) {
            if (bookingMatch.bookingStatus === 'CONFIRMED' || bookingMatch.bookingStatus === 'PAID') {
              status = 'booked';
            } else if (bookingMatch.bookingStatus === 'PENDING') {
              status = 'pending';
            }
          }

          const isPickup = pickupDate === dayDateStr;
          const isReturn = returnDate === dayDateStr;
          const isInRange = pickupDate && returnDate && pickupDate <= dayDateStr && dayDateStr <= returnDate;

          return (
            <button
              key={dayDateStr}
              type="button"
              disabled={status === 'booked'}
              onClick={() => handleDateClick(day)}
              className={`p-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center relative ${
                isPickup || isReturn
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-400 font-black'
                  : isInRange
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : status === 'available'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer'
                  : status === 'pending'
                  ? 'bg-amber-950/50 border border-amber-500/30 text-amber-300 cursor-pointer'
                  : 'bg-rose-950/30 border border-rose-800/30 text-rose-500 opacity-50 cursor-not-allowed line-through'
              }`}
            >
              <span>{day}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  isPickup || isReturn
                    ? 'bg-slate-950'
                    : status === 'available'
                    ? 'bg-emerald-400'
                    : status === 'pending'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-400 text-center font-medium pt-1">
        💡 Click on any available date (Green) on the calendar to select your travel start date.
      </div>

    </div>
  );
}
