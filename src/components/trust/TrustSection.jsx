import React from 'react';
import { TRUST_FEATURES } from '../../data/mockData';
import { ShieldCheck, Gauge, Headphones, Sparkles, RotateCcw, Lock } from 'lucide-react';

const iconMap = {
  ShieldCheck: ShieldCheck,
  Gauge: Gauge,
  Headphones: Headphones,
  Sparkles: Sparkles,
  RotateCcw: RotateCcw,
  Lock: Lock
};

export default function TrustSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative z-20 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200/70 inline-block shadow-sm">
            Why Travelers Trust Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-brand-navy mt-4 tracking-tight">
            The Siddhivinayak Promise
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 font-normal max-w-2xl mx-auto leading-relaxed">
            Designed for seamless road trip experiences across India with zero stress, verified fleet standards, and total pricing transparency.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_FEATURES.map((feature) => {
            const IconComponent = iconMap[feature.iconName] || ShieldCheck;

            return (
              <div
                key={feature.id}
                className="group bg-white p-7 rounded-2xl border border-slate-200/90 hover:border-amber-400/50 shadow-sm hover:shadow-luxury transition-all duration-300 flex items-start gap-4 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-brand-navy group-hover:text-amber-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
