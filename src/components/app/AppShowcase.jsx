import React from 'react';
import { Smartphone, Download, QrCode, Star, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function AppShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0B192C] to-[#060D17] text-white relative overflow-hidden border-t border-slate-800/80">
      
      {/* Background glow */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold mb-4 border border-amber-400/30 shadow-sm">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span className="tracking-wider uppercase text-[11px]">Siddhivinayak Mobile Experience</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Unlock Instant 1-Tap <br />
              <span className="italic font-normal text-amber-400">
                Keyless Car Handover
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed font-normal">
              Download the official Siddhivinayak Tours & Travels mobile app for Android and iOS. Lock/unlock vehicles remotely, track live Fastag balance, inspect digital vehicle checklists, and get instant 24/7 roadside SOS assistance.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-slate-200 text-xs sm:text-sm font-semibold">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span>Paperless Digital Driving License & Aadhaar KYC in under 60 seconds</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-xs sm:text-sm font-semibold">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Live GPS Vehicle Tracking & Remote Engine Immobilizer Safety</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-xs sm:text-sm font-semibold">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <span>App-Exclusive Extra 10% Discount on Every 3rd Booking</span>
              </div>
            </div>

            {/* App Store Buttons & QR Code Container */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              
              {/* Google Play Button */}
              <button
                type="button"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-3 transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 text-emerald-400 flex items-center justify-center font-bold">
                  ▶
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Get it on</span>
                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Google Play
                  </span>
                </div>
              </button>

              {/* App Store Button */}
              <button
                type="button"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-3 transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 text-slate-100 flex items-center justify-center text-xl font-bold">
                  
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Download on the</span>
                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    App Store
                  </span>
                </div>
              </button>

              {/* QR Code Card */}
              <div className="hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-[#060D17] border border-slate-800">
                <div className="w-12 h-12 bg-white p-1 rounded-xl flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block tracking-wider">Scan to Install</span>
                  <span className="text-xs text-slate-300 font-medium">iOS & Android App</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Mobile Phone Graphic Mockup */}
          <div className="flex items-center justify-center relative">
            
            {/* Phone Outer Shell */}
            <div className="relative w-72 sm:w-80 h-[560px] bg-slate-950 rounded-[45px] p-4 border-4 border-slate-800 shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-500">
              
              {/* Dynamic Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
              </div>

              {/* Screen Content */}
              <div className="w-full h-full bg-[#0B192C] rounded-[35px] overflow-hidden pt-12 p-4 flex flex-col justify-between text-white relative">
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-amber-400 tracking-wider">SIDDHIVINAYAK APP</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      ● Active Drive
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 mb-4">
                    <span className="text-[10px] text-slate-300 uppercase font-bold block">Current Booking</span>
                    <h4 className="text-base font-bold text-white mt-1">Mahindra Thar 4x4</h4>
                    <span className="text-xs text-amber-400 font-bold">Registration: MH-02-EX-9988</span>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-black/40">
                        <span className="text-slate-400 block">Fastag Balance</span>
                        <span className="font-bold text-white">₹1,450</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40">
                        <span className="text-slate-400 block">Engine Status</span>
                        <span className="font-bold text-emerald-400">Locked / Safe</span>
                      </div>
                    </div>
                  </div>

                  {/* Remote Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md">
                      🔓 Unlock Vehicle
                    </button>
                    <button className="p-3 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md">
                      🔒 Lock Vehicle
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow-lg">
                  ⚡ 24/7 SOS Emergency Assist
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
