import React, { createContext, useContext, useState, useEffect } from 'react';
import { userDB, PREDEFINED_SUPER_ADMIN } from '../services/userDatabase';
import { generateToken, verifyToken } from '../services/jwtAuth';

const AuthContext = createContext();

const AUTH_USER_KEY = 'siddhivinayak_auth_user_v3';
const AUTH_TOKEN_KEY = 'siddhivinayak_auth_jwt_token_v3';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (savedUser && savedToken) {
        const decoded = verifyToken(savedToken);
        if (decoded) {
          const parsed = JSON.parse(savedUser);
          if (parsed.emailVerified) {
            return parsed;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  // Pending user action intent to resume post-login
  const [pendingIntent, setPendingIntent] = useState(null);
  const [showAuthModalNeeded, setShowAuthModalNeeded] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('Please login to continue');

  // Sync auth state to localStorage
  useEffect(() => {
    try {
      if (user && token) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state', e);
    }
  }, [user, token]);

  /**
   * Action Interceptor / Guard Function
   * If logged in, executes onAllowed callback directly.
   * If unauthenticated, saves pendingIntent and opens login modal.
   */
  const requireAuth = (onAllowed, promptMessage = 'Please login to continue', overrideUser = null) => {
    const activeUser = overrideUser || user;
    if (activeUser && activeUser.emailVerified) {
      if (typeof onAllowed === 'function') onAllowed();
      return true;
    }

    setPendingIntent({ onAllowed });
    setAuthPromptMessage(promptMessage);
    setShowAuthModalNeeded(true);
    return false;
  };

  /**
   * Resume pending intent post-login
   */
  const triggerPendingIntentResume = () => {
    if (pendingIntent && typeof pendingIntent.onAllowed === 'function') {
      const callback = pendingIntent.onAllowed;
      setPendingIntent(null);
      setShowAuthModalNeeded(false);
      setTimeout(() => callback(), 100);
    } else {
      setShowAuthModalNeeded(false);
    }
  };

  /**
   * Secure Login Procedure via PHP MySQL API Layer
   */
  const login = async ({ email, password }) => {
    try {
      const result = await userDB.login({ email, password });
      setUser(result.user);
      setToken(result.token);
      triggerPendingIntentResume();
      return result;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Public Registration Procedure via PHP MySQL API Layer
   */
  const register = async ({ name, email, mobile, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      throw new Error('Password and Confirm Password do not match.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { user: unverifiedUser, emailDelivery } = await userDB.registerUser({ name, email, mobile, password, confirmPassword });
    return { user: unverifiedUser, requiresVerification: true, emailDelivery };
  };

  /**
   * 1-Click Test Login Presets
   */
  const loginAsPreset = async (roleType) => {
    let targetEmail = 'rahul.sharma@example.com';
    let targetPass = 'user123';

    if (roleType === 'SUPER_ADMIN') {
      targetEmail = PREDEFINED_SUPER_ADMIN.email;
      targetPass = 'siddhi@2005';
    } else if (roleType === 'ADMIN') {
      targetEmail = 'admin@siddhivinayak.com';
      targetPass = 'admin123';
    }

    return await login({ email: targetEmail, password: targetPass });
  };

  /**
   * Complete verification and set active user session
   */
  const completeVerification = (verifiedUser) => {
    const jwtToken = generateToken(verifiedUser);
    setUser(verifiedUser);
    setToken(jwtToken);

    triggerPendingIntentResume();

    let redirectUrl = '/user/dashboard';
    if (verifiedUser.role === 'SUPER_ADMIN') redirectUrl = '/super-admin/dashboard';
    else if (verifiedUser.role === 'ADMIN') redirectUrl = '/admin/dashboard';

    return { user: verifiedUser, token: jwtToken, redirectUrl };
  };

  /**
   * Logout Procedure
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    setPendingIntent(null);
    setShowAuthModalNeeded(false);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      requireAuth,
      showAuthModalNeeded,
      setShowAuthModalNeeded,
      authPromptMessage,
      login, 
      register, 
      completeVerification,
      loginAsPreset, 
      logout, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
