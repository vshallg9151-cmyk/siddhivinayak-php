import React, { useState } from 'react';
import { SPECIAL_OFFERS } from '../../data/mockData';
import { Tag, Copy, Check, Sparkles, Gift, ArrowRight } from 'lucide-react';

export default function OffersSection({ onCopyCoupon }) {
  const [copiedCode, setCopiedCode] = useState('');

  const handleCopy = (code) => {
    setCopiedCode(code);
    navigator.clipboard?.writeText(code);
    if (onCopyCoupon) {
      onCopyCoupon(code);
    }
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <section id="offers" className="py-20 bg-white relative border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200/70 inline-block shadow-sm">
            Exclusive Deals & Savings
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-brand-navy mt-3 tracking-tight">
            Special Rental Offers & Promo Codes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto font-normal leading-relaxed">
            Unlock additional discounts on your upcoming weekend road trip, long-term rental, or airport transfer.
          </p>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SPECIAL_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className={`bg-gradient-to-br ${offer.bgGradient} text-white rounded-3xl p-7 shadow-luxury border border-white/10 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
            >
              {/* Background Accent Ornament */}
              <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3.5 py-1 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 shadow-sm uppercase tracking-wider">
                    {offer.tag}
                  </span>
                  <Gift className="w-5 h-5 text-amber-300" />
                </div>

                <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-300 tracking-tight block">
                  {offer.discount}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-1 mb-2">
                  {offer.title}
                </h3>
                <p className="text-slate-200/90 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  {offer.description}
                </p>
              </div>

              {/* Promo Code Copy Bar */}
              <div className="pt-4 border-t border-white/15">
                <span className="text-[10px] uppercase font-bold text-slate-300 block mb-2 tracking-wider">
                  {offer.validity}
                </span>
                <div className="flex items-center justify-between bg-black/45 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 pl-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-sm font-extrabold tracking-widest text-white">
                      {offer.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
