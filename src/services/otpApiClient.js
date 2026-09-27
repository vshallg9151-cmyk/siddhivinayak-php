/**
 * Client-Side OTP API Communication Service
 * Dispatches HTTP requests to secure backend endpoints:
 * - POST /api/auth/send-email-otp
 * - POST /api/auth/verify-email-otp
 * - POST /api/auth/send-mobile-otp
 * - POST /api/auth/verify-mobile-otp
 * - POST /api/auth/resend-email-otp
 * - POST /api/auth/resend-mobile-otp
 *
 * CRITICAL SECURITY & REAL OTP VERIFICATION:
 * 1. Zero secret API keys exist in this client code.
 * 2. Uses stateless HMAC tokens so real email/mobile OTPs verify seamlessly across Vercel serverless functions.
 * 3. NO fallback demo OTP (like 123456) is accepted. Only the real OTP sent to the user's email/mobile is verified.
 */

async function postJson(url, data) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const contentType = res.headers.get('content-type') || '';
    let json = {};
    if (contentType.includes('application/json')) {
      json = await res.json().catch(() => ({}));
    }

    return {
      ok: res.ok && json.success === true,
      status: res.status,
      data: json
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: {
        success: false,
        message: 'Network error communicating with authentication server.'
      }
    };
  }
}

function storeSessionToken(key, token) {
  if (!token) return;
  try {
    sessionStorage.setItem(key, token);
  } catch {}
}

function getSessionToken(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function removeSessionToken(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

/**
 * Dispatch Email OTP via Backend
 */
export async function apiSendEmailOtp({ email, name }) {
  const result = await postJson('/api/auth/send-email-otp', { email, name });
  const otpToken = result.data?.otpToken || null;
  const cleanEmail = (email || '').toLowerCase().trim();

  if (otpToken) {
    storeSessionToken(`otp_token_email_${cleanEmail}`, otpToken);
  }

  if (result.ok) {
    return {
      success: true,
      message: result.data?.message || 'OTP sent successfully to email.',
      expiresIn: result.data?.expiresIn || 300,
      provider: result.data?.provider || 'Email Gateway',
      devOtp: result.data?.devOtp || null,
      otpToken,
      error: null
    };
  }

  return {
    success: false,
    message: result.data?.message || 'Failed to send OTP to email. Please try again.',
    error: result.data?.message || 'Failed to send OTP.'
  };
}

/**
 * Verify Email OTP Code
 */
export async function apiVerifyEmailOtp({ email, otp, otpToken }) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const tokenToUse = otpToken || getSessionToken(`otp_token_email_${cleanEmail}`);

  const result = await postJson('/api/auth/verify-email-otp', {
    email: cleanEmail,
    otp,
    otpToken: tokenToUse
  });

  if (result.ok) {
    removeSessionToken(`otp_token_email_${cleanEmail}`);
    return {
      success: true,
      message: result.data?.message || 'Email verified successfully.',
      error: null
    };
  }

  return {
    success: false,
    message: result.data?.message || 'Invalid OTP code. Please check your email and enter the correct OTP.',
    error: result.data?.message || 'Invalid OTP code.'
  };
}

/**
 * Dispatch Mobile SMS OTP
 */
export async function apiSendMobileOtp({ mobile, name }) {
  const result = await postJson('/api/auth/send-mobile-otp', { mobile, name });
  const otpToken = result.data?.otpToken || null;
  const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);

  if (otpToken) {
    storeSessionToken(`otp_token_mobile_${cleanMobile}`, otpToken);
  }

  if (result.ok) {
    return {
      success: true,
      message: result.data?.message || 'OTP sent successfully to mobile.',
      expiresIn: result.data?.expiresIn || 300,
      otpToken,
      error: null
    };
  }

  return {
    success: false,
    message: result.data?.message || 'Failed to send SMS OTP. Please try again.',
    error: result.data?.message || 'Failed to send OTP.'
  };
}

/**
 * Verify Mobile SMS OTP
 */
export async function apiVerifyMobileOtp({ mobile, otp, otpToken }) {
  const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);
  const tokenToUse = otpToken || getSessionToken(`otp_token_mobile_${cleanMobile}`);

  const result = await postJson('/api/auth/verify-mobile-otp', {
    mobile: cleanMobile,
    otp,
    otpToken: tokenToUse
  });

  if (result.ok) {
    removeSessionToken(`otp_token_mobile_${cleanMobile}`);
    return {
      success: true,
      message: result.data?.message || 'Mobile verified successfully.',
      error: null
    };
  }

  return {
    success: false,
    message: result.data?.message || 'Invalid OTP code. Please check your mobile and enter the correct OTP.',
    error: result.data?.message || 'Invalid OTP code.'
  };
}

/**
 * Resend Email OTP
 */
export async function apiResendEmailOtp({ email, name }) {
  const result = await postJson('/api/auth/resend-email-otp', { email, name });
  const otpToken = result.data?.otpToken || null;
  const cleanEmail = (email || '').toLowerCase().trim();

  if (otpToken) {
    storeSessionToken(`otp_token_email_${cleanEmail}`, otpToken);
  }

  if (result.ok) {
    return {
      success: true,
      message: result.data?.message || 'New OTP sent to email.',
      provider: result.data?.provider || null,
      devOtp: result.data?.devOtp || null,
      otpToken,
      error: null
    };
  }

  return {
    success: false,
    message: result.data?.message || 'Failed to resend Email OTP. Please try again.',
    error: result.data?.message || 'Failed to resend OTP.'
  };
}

/**
 * Resend Mobile SMS OTP
 */
export async function apiResendMobileOtp({ mobile, name }) {
  const result = await postJson('/api/auth/resend-mobile-otp', { mobile, name });
  const otpToken = result.data?.otpToken || null;
  const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);

  if (otpToken) {
    storeSessionToken(`otp_token_mobile_${cleanMobile}`, otpToken);
  }

  if (result.ok) {
    return {
      success: true,
      message: result.data?.message || 'New OTP sent to mobile.',
      otpToken,
      error: null
    };
  }

  return {
    success: false,
    message: result.data?.message || 'Failed to resend Mobile OTP. Please try again.',
    error: result.data?.message || 'Failed to resend OTP.'
  };
}
