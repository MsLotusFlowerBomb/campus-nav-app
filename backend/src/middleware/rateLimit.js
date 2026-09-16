// src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * Login: 5 attempts per 15 minutes per IP + per student number.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // ipKeyGenerator normalizes IPv6 addresses (e.g. ::1 → ::/64 block)
    const ip = ipKeyGenerator(req.ip || req.connection?.remoteAddress || 'unknown');
    const sn = (req.body?.studentNumber || 'unknown').toString().toUpperCase();
    return `${ip}:${sn}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 15 minutes and try again.',
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Register: prevent mass account creation from one IP.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registrations from this network. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Guest: prevent mass guest creation.
 */
const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many guest sessions created from this network. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Forgot password: limit repeated reset requests.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip || req.connection?.remoteAddress || 'unknown');
    const email = (req.body?.email || '').toString().trim().toLowerCase();
    const sn = (req.body?.studentNumber || '').toString().trim().toUpperCase();
    return `${ip}:${email || sn || 'unknown'}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please wait and try again.',
      timestamp: new Date().toISOString(),
    });
  },
});

module.exports = { loginLimiter, registerLimiter, guestLimiter, forgotPasswordLimiter };