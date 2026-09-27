/**
 * Standalone Production Server for Siddhivinayak Tours & Travels
 * Serves static assets and provides secure server-side OTP dispatch API routes.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleSendEmailOtp,
  handleVerifyEmailOtp,
  handleSendMobileOtp,
  handleVerifyMobileOtp,
  handleResendEmailOtp,
  handleResendMobileOtp
} from './server/otpBackend.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

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

const server = http.createServer(async (req, res) => {
  const url = req.url ? req.url.split('?')[0] : '/';

  // 1. API Route Handlers
  if (url.startsWith('/api/auth/')) {
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
      console.error('[PRODUCTION SERVER ERROR]:', err);
      return sendJsonResponse(res, 500, { success: false, message: 'Internal Server Error' });
    }
  }

  // 2. Static File Serving
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found. Please run `npm run build` first.');
  }
});

server.listen(PORT, () => {
  console.log(`[Siddhivinayak Server] Production Server running at http://localhost:${PORT}`);
});
