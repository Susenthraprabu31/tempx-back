import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config/env.js';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/email.js';
import newsletterRoutes from './routes/newsletter.js';
import User from './models/User.js';

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: config.frontend.url,
    credentials: true
}));

// Session middleware (required for passport)
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// PASSPORT CONFIGURATION
// ============================================

// Google OAuth Strategy
if (config.google.clientID && config.google.clientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.google.clientID,
                clientSecret: config.google.clientSecret,
                callbackURL: config.google.callbackURL
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists with this Google ID
                    let user = await User.findByGoogleId(profile.id);

                    if (!user) {
                        // Check if user exists with this email
                        const email = profile.emails[0].value;
                        user = await User.findByEmail(email);

                        if (user) {
                            // Link Google account to existing user
                            await User.update(user.id, { google_id: profile.id });
                            user = await User.findById(user.id);
                        } else {
                            // Create new user
                            user = await User.create({
                                email: email,
                                name: profile.displayName,
                                googleId: profile.id
                            });
                        }
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
} else {
    console.warn('[Warning] Google OAuth credentials not configured. OAuth login will not work.');
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TempMailX API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/auth', authRoutes);
app.use('/email', emailRoutes);
app.use('/newsletter', newsletterRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(config.env === 'development' && { stack: err.stack })
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = config.port;

// Connect to database and start server
connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║         TempMailX API Server              ║
║                                           ║
╚═══════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Environment: ${config.env}
✓ Frontend URL: ${config.frontend.url}
✓ Database: Connected
✓ Email expiry: ${config.email.expiryHours} hours

API Endpoints:
  POST   /auth/signup
  POST   /auth/login
  GET    /auth/google
  GET    /auth/google/callback
  GET    /auth/me
  POST   /email/create
  GET    /email/inbox
  GET    /email/outbox
  POST   /email/send
  GET    /email/:id
  DELETE /email/:id

Ready to accept requests! 🚀
      `);
        });
    })
    .catch((error) => {
        console.error('[Server] Failed to start:', error.message);
        process.exit(1);
    });

export default app;
