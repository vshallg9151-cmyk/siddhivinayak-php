import React from 'react';

export default function BackgroundWrapper({ children, imageUrl }) {
  const bgImage = imageUrl || "/hero_sunset_highway.jpg";

  return (
    <div className="relative min-h-screen bg-[#0B192C] text-slate-100 font-sans overflow-x-hidden">
      
      {/* Background Image Container matching Home Hero */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={bgImage}
          alt="Cinematic Scenic Background"
          className="w-full h-full object-cover object-center scale-105 filter brightness-70 contrast-105 transition-all duration-1000"
        />
        {/* Dark Deep Navy Gradients matching Home Hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060D17] via-[#0B192C]/70 to-[#0B192C]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060D17]/85 via-transparent to-[#060D17]/75" />
      </div>

      {/* Floating Ambient Glowing Orbs */}
      <div className="fixed top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Page Content Container - Transparent so background is crisp and visible */}
      <div className="relative z-10 bg-transparent">
        {children}
      </div>

    </div>
  );
}
