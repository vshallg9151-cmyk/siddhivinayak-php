import React from 'react';
import { Check, Lock, MapPin, Calendar, Car, FileText } from 'lucide-react';

export default function StepProgressHeader({ currentStep, highestStepReached = 1, onNavigate }) {
  const steps = [
    { id: 1, title: 'Login / Signup', page: 'login', icon: Lock },
    { id: 2, title: 'Booking Details', page: 'booking', icon: MapPin },
    { id: 3, title: 'Date & Time', page: 'dates', icon: Calendar },
    { id: 4, title: 'Car Selection', page: 'cars', icon: Car },
    { id: 5, title: 'Summary & Confirmation', page: 'confirmation', icon: FileText }
  ];

  return (
    <div className="w-full bg-[#0B192C]/90 backdrop-blur-xl border border-white/15 rounded-3xl lg:rounded-full p-3 sm:p-4 shadow-2xl mb-8">
      <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none gap-2 px-1 sm:px-2">
        {steps.map((step, idx) => {
          const stepNum = step.id;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isNavigable = stepNum <= Math.max(currentStep, highestStepReached);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step Button */}
              <button
                type="button"
                disabled={!isNavigable}
                onClick={() => isNavigable && onNavigate && onNavigate(step.page)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all shrink-0 text-xs font-bold ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-105 border border-amber-300 cursor-pointer'
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40 cursor-pointer'
                    : isNavigable
                    ? 'bg-white/10 text-slate-200 border border-white/15 hover:bg-white/15 cursor-pointer'
                    : 'bg-black/30 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isCurrent
                      ? 'bg-slate-950 text-amber-400'
                      : isCompleted
                      ? 'bg-emerald-500 text-slate-950'
                      : isNavigable
                      ? 'bg-white/20 text-slate-200'
                      : 'bg-black/40 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className="whitespace-nowrap font-bold tracking-wide">{step.title}</span>
              </button>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 min-w-[12px] sm:min-w-[20px] flex-1 shrink-0 rounded-full transition-colors ${
                    stepNum < currentStep ? 'bg-emerald-500' : 'bg-white/15'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
