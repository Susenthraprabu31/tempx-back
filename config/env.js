import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 * Centralizes all environment variables and configuration settings
 */
export const config = {
  // Server configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expire: process.env.JWT_EXPIRE || '7d'
  },

  // Google OAuth configuration
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
  },

  // Frontend configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'fallback-session-secret'
  },

  // Email configuration
  email: {
    expiryHours: parseInt(process.env.EMAIL_EXPIRY_HOURS, 10) || 24,
    cleanupIntervalMinutes: parseInt(process.env.EMAIL_CLEANUP_INTERVAL_MINUTES, 10) || 30
  },

  // Database configuration (Supabase)
  database: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  }
};

export default config;
