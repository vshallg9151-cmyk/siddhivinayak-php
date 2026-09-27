import React from 'react';
import { REVIEWS } from '../../data/mockData';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function ReviewsSection() {
  return (
    <section className="py-20 bg-[#0B192C] text-white relative overflow-hidden border-t border-slate-800/80">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 inline-block shadow-sm">
            Real Travelers, Real Stories
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white mt-3 tracking-tight">
            Loved by 50,000+ Indian Road-Trippers
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-2xl mx-auto font-normal leading-relaxed">
            Read verified reviews from families, friend groups, and corporate travelers exploring India's circuits.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-[#060D17]/85 rounded-3xl p-7 border border-slate-800 hover:border-amber-400/40 shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
            >
              <div>
                {/* Trip Photo Preview */}
                <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 border border-slate-800">
                  <img
                    src={review.tripPhoto}
                    alt={`${review.name}'s trip with ${review.carUsed}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1.5 border border-white/10">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified Trip: {review.carUsed}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote Body */}
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed italic font-normal mb-6">
                  "{review.review}"
                </p>
              </div>

              {/* Customer Avatar & Profile */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{review.name}</h4>
                  <span className="text-xs text-slate-400 font-medium">{review.city}, India</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
