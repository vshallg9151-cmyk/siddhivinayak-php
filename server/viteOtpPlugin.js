/**
 * Vite Server Backend Middleware Plugin
 * Intercepts /api/auth/* routes and executes real server-side OTP dispatch via Resend & Fast2SMS.
 * Works seamlessly in both dev mode (`npm run dev`) and preview mode (`npm run preview`).
 */

import {
  handleSendEmailOtp,
  handleVerifyEmailOtp,
  handleSendMobileOtp,
  handleVerifyMobileOtp,
  handleResendEmailOtp,
  handleResendMobileOtp
} from './otpBackend.js';

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

export function otpBackendPlugin() {
  return {
    name: 'siddhivinayak-otp-backend-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        if (!url.startsWith('/api/auth/')) {
          return next();
        }

        if (req.method !== 'POST') {
          return sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
        }

        try {
          const body = await parseRequestBody(req);

          if (url === '/api/auth/send-email-otp') {
            const result = await handleSendEmailOtp(body);
            return sendJsonResponse(res, result.status, result.data);
          }

          if (url === '/api/auth/verify-email-otp') {
            const result = await handleVerifyEmailOtp(body);
            return sendJsonResponse(res, result.status, result.data);
          }

          if (url === '/api/auth/send-mobile-otp') {
            const result = await handleSendMobileOtp(body);
            return sendJsonResponse(res, result.status, result.data);
          }

          if (url === '/api/auth/verify-mobile-otp') {
            const result = await handleVerifyMobileOtp(body);
            return sendJsonResponse(res, result.status, result.data);
          }

          if (url === '/api/auth/resend-email-otp') {
            const result = await handleResendEmailOtp(body);
            return sendJsonResponse(res, result.status, result.data);
          }

          if (url === '/api/auth/resend-mobile-otp') {
            const result = await handleResendMobileOtp(body);
            return sendJsonResponse(res, result.status, result.data);
          }

          return sendJsonResponse(res, 404, { success: false, message: 'API Route Not Found' });
        } catch (err) {
          console.error('[SERVER ERROR in OTP API Middleware]:', err);
          return sendJsonResponse(res, 500, { success: false, message: 'Internal Server Error' });
        }
      });
    }
  };
}
