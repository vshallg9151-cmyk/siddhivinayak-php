import React from 'react';
import { DISPLAY_PHONE, createWhatsAppEnquiryUrl } from '../../utils/whatsappHelper';
import { Car, Phone, Mail, MapPin, Clock, ShieldCheck, MessageSquare } from 'lucide-react';

export default function Footer({ onOpenLegal }) {
  const whatsappUrl = createWhatsAppEnquiryUrl({
    carName: 'Enquiry',
    rentalType: 'Self Drive / With Driver',
    pickupCity: 'Pan India'
  });

  return (
    <footer className="bg-[#060D17] text-slate-300 pt-16 pb-10 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/25 text-slate-950 font-black">
                <Car className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-wider">SIDDHIVINAYAK</span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-400">Tours & Travels</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              India's premier luxury mobility platform and car rental service. Dedicated to delivering verified safety, transparent pricing, and 24x7 roadside assistance across India.
            </p>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-300/90 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GST Registered & All-India Tourist Permit Holder</span>
            </div>
          </div>

          {/* Column 2: Quick Links & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 border-b border-slate-800/80 pb-2 text-amber-400">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button onClick={() => onOpenLegal && onOpenLegal('privacy')} className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal && onOpenLegal('terms')} className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal && onOpenLegal('refund')} className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal && onOpenLegal('cookies')} className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
                  Cookie Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal && onOpenLegal('about')} className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
                  About Us & Fleet Headquarters
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Locations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 border-b border-slate-800/80 pb-2 text-amber-400">
              Popular Circuits
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Mumbai & Pune</li>
              <li className="hover:text-white transition-colors cursor-pointer">Delhi & Haridwar</li>
              <li className="hover:text-white transition-colors cursor-pointer">Char Dham Yatra</li>
              <li className="hover:text-white transition-colors cursor-pointer">12 Jyotirlinga</li>
              <li className="hover:text-white transition-colors cursor-pointer">Kashmir Valleys</li>
              <li className="hover:text-white transition-colors cursor-pointer">Goa Coastal</li>
              <li className="hover:text-white transition-colors cursor-pointer">Gujarat Kutch</li>
              <li className="hover:text-white transition-colors cursor-pointer">Rajasthan Heritage</li>
            </ul>
          </div>

          {/* Column 4: Official Helpline Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 border-b border-slate-800/80 pb-2 text-amber-400">
              24×7 Concierge Helpline
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">
                  Plot 44, Express Highway Service Road, Dadar West, Mumbai 400028
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:9173746558" className="text-white font-bold text-sm hover:text-amber-400 transition-colors">
                  {DISPLAY_PHONE}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">
                  WhatsApp Support: {DISPLAY_PHONE}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">info@siddhivinayaktours.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Siddhivinayak Tours and Travels. All rights reserved.</span>
          </div>

          {/* Accepted Payment Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Accepted Payments:</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#0B192C] text-slate-200 font-bold text-[10px] border border-slate-700">UPI / GPay</span>
              <span className="px-2.5 py-1 rounded-full bg-[#0B192C] text-slate-200 font-bold text-[10px] border border-slate-700">Credit / Debit</span>
              <span className="px-2.5 py-1 rounded-full bg-[#0B192C] text-slate-200 font-bold text-[10px] border border-slate-700">NetBanking</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
