import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, Eye, EyeOff, ShieldCheck, ArrowRight, Crown, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OtpVerificationModal from './OtpVerificationModal';
import { userDB } from '../../services/userDatabase';

export default function AuthModal({ initialMode = 'login', onClose, onAuthSuccess }) {
  const { login, register, loginAsPreset, completeVerification } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
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

  // Messages State
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    try {
      if (mode === 'login') {
        const { user: loggedInUser, redirectUrl } = await login({ email, password });
        if (onAuthSuccess) onAuthSuccess(loggedInUser, redirectUrl);
        onClose();
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
        // Catch blocked unverified login attempts and prompt OTP Verification Modal
        setErrorMessage(err.message);
        setVerifyingUser(err.unverifiedUser);
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check your inputs.');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email or mobile number to reset password.');
      return;
    }
    setErrorMessage('');
    setInfoMessage('');

    try {
      const existingUser = await userDB.findByEmail(email);
      if (!existingUser) {
        setErrorMessage('No user account found with this email address.');
        return;
      }
      setResetUser(existingUser);
      setVerifyingUser(existingUser);
      setInfoMessage('Verification OTP sent to your registered email for password reset.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initiate password reset.');
    }
  };

  const handleSetNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      await userDB.resetPassword({ userId: resetUser.id, newPassword });
      setResetPasswordStep(false);
      setForgotPasswordView(false);
      setMode('login');
      setEmail(resetUser.email);
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setResetUser(null);
      setInfoMessage('✅ Password reset successfully! Please sign in with your new password.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPresetLogin = (roleType) => {
    setErrorMessage('');
    setInfoMessage('');
    if (roleType === 'SUPER_ADMIN') {
      setEmail('vshallg9151@gmail.com');
      setPassword('');
      setInfoMessage('Super Admin Owner email selected. Please enter your password to sign in.');
    } else if (roleType === 'ADMIN') {
      setEmail('admin@siddhivinayak.com');
      setPassword('');
      setInfoMessage('Operations Admin email selected. Please enter your password to sign in.');
    } else if (roleType === 'USER') {
      setEmail('rahul.sharma@example.com');
      setPassword('');
      setInfoMessage('Customer email selected. Please enter your password to sign in.');
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
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 text-slate-100 overflow-hidden my-8 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
            S
          </div>
          <h2 className="text-2xl font-black text-white">
            {forgotPasswordView 
              ? 'Reset Password' 
              : mode === 'login' 
                ? 'Welcome Back to Siddhivinayak' 
                : 'Create Verified Account'}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {forgotPasswordView
              ? 'Enter email or mobile to receive dual verification OTPs'
              : mode === 'login'
                ? 'Secure dual OTP authenticated portal'
                : 'Requires both Email & Mobile OTP verification'}
          </p>
        </div>

        {/* Tab Toggle */}
        {!forgotPasswordView && (
          <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`w-1/2 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              className={`w-1/2 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-xs text-rose-300 flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form */}
        {resetPasswordStep ? (
          <form onSubmit={handleSetNewPasswordSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => { setResetPasswordStep(false); setForgotPasswordView(false); setErrorMessage(''); setInfoMessage(''); }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              ← Cancel & Back to Sign In
            </button>
          </form>
        ) : forgotPasswordView ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="name@example.com or 9876543210"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              Generate Dual Reset OTPs
            </button>

            <button
              type="button"
              onClick={() => { setForgotPasswordView(false); setErrorMessage(''); setInfoMessage(''); }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          /* Normal Login / Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                {mode === 'login' ? 'Email Address or Mobile Number' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  required
                  placeholder={mode === 'login' ? 'name@example.com or 9876543210' : 'name@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Mobile Number (For SMS OTP)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setForgotPasswordView(true); setErrorMessage(''); }}
                    className="text-[10px] font-bold text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{mode === 'login' ? 'Log In to Account' : 'Register & Send Dual OTPs'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 1-Click Quick Preset Logins */}
        {!forgotPasswordView && (
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3 flex items-center justify-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Quick 1-Click Account Sign-In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickPresetLogin('SUPER_ADMIN')}
                className="py-2 px-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl text-[10px] font-bold border border-purple-500/30 flex flex-col items-center gap-0.5"
                title="Super Admin Owner (vshallg9151@gmail.com)"
              >
                <span>👑 Super Admin</span>
                <span className="text-[8px] text-purple-400 font-extrabold">Owner</span>
              </button>

              <button
                onClick={() => handleQuickPresetLogin('ADMIN')}
                className="py-2 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-[10px] font-bold border border-amber-500/30 flex flex-col items-center gap-0.5"
                title="Admin Account (admin@siddhivinayak.com)"
              >
                <span>🛡️ Admin</span>
                <span className="text-[8px] opacity-75">Operations</span>
              </button>

              <button
                onClick={() => handleQuickPresetLogin('USER')}
                className="py-2 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl text-[10px] font-bold border border-blue-500/30 flex flex-col items-center gap-0.5"
                title="User Account (rahul.sharma@example.com)"
              >
                <span>👤 User</span>
                <span className="text-[8px] opacity-75">Customer</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
