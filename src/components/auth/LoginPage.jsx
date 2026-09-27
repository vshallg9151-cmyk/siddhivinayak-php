import React, { useState, useEffect } from 'react';
import { Lock, Mail, Phone, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Compass, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OtpVerificationModal from './OtpVerificationModal';
import { userDB } from '../../services/userDatabase';
import StepProgressHeader from '../booking/StepProgressHeader';
import BackgroundWrapper from '../common/BackgroundWrapper';

export default function LoginPage({ onNavigate, onAuthSuccess }) {
  const { user: authUser, login, register, completeVerification } = useAuth();

  // If user is already logged in, automatically redirect to booking step
  useEffect(() => {
    if (authUser && authUser.emailVerified) {
      if (onNavigate) {
        onNavigate('booking');
      }
    }
  }, [authUser, onNavigate]);

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Reset Password State
  const [forgotPasswordView, setForgotPasswordView] = useState(false);
  const [resetPasswordStep, setResetPasswordStep] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  
  // Verification Modal State
  const [verifyingUser, setVerifyingUser] = useState(null);

  // Messages & Loading State
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user: loggedInUser, redirectUrl } = await login({ email, password });
        if (onAuthSuccess) onAuthSuccess(loggedInUser, redirectUrl);
        else if (onNavigate) onNavigate('booking', null, loggedInUser);
      } else {
        // Sign Up
        const { user: registeredUser } = await register({ 
          name: fullName, 
          email, 
          mobile, 
          password,
          confirmPassword 
        });
        
        // Launch Dual OTP Verification Modal for newly registered user
        setVerifyingUser(registeredUser);
      }
    } catch (err) {
      if (err.unverifiedUser) {
        setErrorMessage(err.message);
        setVerifyingUser(err.unverifiedUser);
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (!email) {
        setErrorMessage('Please enter your registered email address.');
        setLoading(false);
        return;
      }

      const existingUser = await userDB.findByEmail(email);
      if (!existingUser) {
        setErrorMessage('No user account found with this email address.');
        setLoading(false);
        return;
      }

      setVerifyingUser(existingUser);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initiate password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      await userDB.resetPassword({ userId: resetUser.id, newPassword });
      setInfoMessage('Password successfully reset! Please log in with your new password.');
      setForgotPasswordView(false);
      setResetPasswordStep(false);
      setResetUser(null);
      setMode('login');
      setPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
    }
  };

  const handleVerificationComplete = (verifiedUser) => {
    setVerifyingUser(null);
    if (forgotPasswordView) {
      setResetUser(verifiedUser);
      setResetPasswordStep(true);
      setInfoMessage('Email OTP verified! Please enter your new password below.');
    } else {
      const { user: activeUser, redirectUrl } = completeVerification(verifiedUser);
      if (onAuthSuccess) onAuthSuccess(activeUser, redirectUrl);
      else if (onNavigate) onNavigate('booking', null, activeUser);
    }
  };

  if (verifyingUser) {
    return (
      <OtpVerificationModal
        user={verifyingUser}
        onClose={() => setVerifyingUser(null)}
        onVerificationComplete={handleVerificationComplete}
      />
    );
  }

  return (
    <BackgroundWrapper>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-24 sm:pt-28 pb-20 font-sans text-slate-900">
        <div className="max-w-5xl mx-auto mb-6">
          <StepProgressHeader currentStep={1} highestStepReached={1} onNavigate={onNavigate} />
        </div>

        {/* Unified Outer Authentication Card */}
        <div className="w-full max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200/80 overflow-hidden relative min-h-[600px] transition-all duration-500">
          
          {/* ======================================================== */}
          {/* MOVABLE / SLIDING OVERLAY VISUAL PANEL (Desktop md:flex)   */}
          {/* ======================================================== */}
          <div 
            className={`hidden md:flex absolute top-0 bottom-0 z-30 w-1/2 h-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
              mode === 'signup' ? 'left-0 translate-x-full' : 'left-0 translate-x-0'
            }`}
          >
            <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-8 lg:p-12 text-white select-none shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" 
                alt="Siddhivinayak Mountain Travel" 
                className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-amber-950/80 backdrop-blur-[2px]" />

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 font-black text-2xl border border-amber-300/40">
                    S
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-white tracking-wide leading-tight">SIDDHIVINAYAK</h2>
                    <p className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase">Tours & Travels</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto py-6">
                {mode === 'login' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left duration-500">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>New Here? Start Your Journey</span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight">Embark on Extraordinary Expeditions</h3>
                    <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-normal max-w-sm">
                      Create an account to unlock premium car rentals, custom pilgrimage yatras & exclusive member travel discounts across India.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setErrorMessage(''); setInfoMessage(''); }}
                      className="mt-4 px-8 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs border border-white/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-[1.03] flex items-center gap-2.5 group cursor-pointer"
                    >
                      <span>CREATE AN ACCOUNT</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Welcome Back Traveler</span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight">Already Registered With Us?</h3>
                    <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-normal max-w-sm">
                      Sign in with your credentials to access saved trips, live trip itineraries, and instant luxury vehicle bookings.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
                      className="mt-4 px-8 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs border border-white/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-[1.03] flex items-center gap-2.5 group cursor-pointer"
                    >
                      <span>SIGN IN TO YOUR ACCOUNT</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Verified Chauffeurs</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> 24/7 Concierge</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MOBILE TOP VISUAL HEADER (Mobile md:hidden)              */}
          {/* ======================================================== */}
          <div className="md:hidden relative p-6 text-white text-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" 
              alt="Siddhivinayak Mountain Travel" 
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-amber-950/90" />
            <div className="relative z-10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto text-slate-950 font-black text-xl shadow-md">S</div>
              <h2 className="text-xl font-black text-white">SIDDHIVINAYAK TOURS</h2>
              <p className="text-[11px] text-amber-300 font-medium">
                {mode === 'login' ? 'Welcome Back! Sign in to continue' : 'Create an account to start your journey'}
              </p>
            </div>
          </div>

          {/* Mobile Segmented Toggle Tab */}
          {!forgotPasswordView && (
            <div className="md:hidden p-4 pb-0">
              <div className="flex p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(''); setInfoMessage(''); }}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'signup' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* UNIFIED FORMS CONTAINER (Desktop Split / Mobile Stacked) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 relative w-full min-h-[580px]">
            
            {/* LEFT SLOT: SIGN UP FORM */}
            <div className={`p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white transition-all duration-500 ${
              mode === 'signup' ? 'opacity-100 z-20 pointer-events-auto block' : 'opacity-0 md:opacity-30 z-0 pointer-events-none hidden md:flex'
            }`}>
              <div className="max-w-sm mx-auto w-full space-y-4 text-slate-900">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Fill in your details for secure dual OTP authentication</p>
                </div>

                {errorMessage && mode === 'signup' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {infoMessage && mode === 'signup' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Mobile Number (For SMS OTP) *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    {loading ? 'Creating Account...' : 'Register & Send Dual OTPs'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT SLOT: SIGN IN FORM */}
            <div className={`p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white transition-all duration-500 ${
              mode === 'login' ? 'opacity-100 z-20 pointer-events-auto block' : 'opacity-0 md:opacity-30 z-0 pointer-events-none hidden md:flex'
            }`}>
              <div className="max-w-sm mx-auto w-full space-y-4 text-slate-900">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {forgotPasswordView ? 'Reset Password' : 'Sign In'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {forgotPasswordView ? 'Enter email/mobile to receive OTPs' : 'Access your Siddhivinayak Portal account'}
                  </p>
                </div>

                {errorMessage && mode === 'login' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {infoMessage && mode === 'login' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                {resetPasswordStep ? (
                  <form onSubmit={handleSetNewPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setResetPasswordStep(false); setForgotPasswordView(false); setErrorMessage(''); setInfoMessage(''); }}
                      className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      ← Cancel & Back to Sign In
                    </button>
                  </form>
                ) : forgotPasswordView ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Registered Email or Mobile Number</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="name@example.com or 9876543210"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? 'Sending OTPs...' : 'Generate Reset OTPs'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setForgotPasswordView(false); setErrorMessage(''); setInfoMessage(''); }}
                      className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1">Email Address or Mobile Number *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="name@example.com or 9876543210"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Password *</label>
                        <button
                          type="button"
                          onClick={() => { setForgotPasswordView(true); setErrorMessage(''); }}
                          className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-500 rounded"
                        />
                        <span className="text-xs text-slate-600 font-medium">Remember me</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Sign In'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </BackgroundWrapper>
  );
}
