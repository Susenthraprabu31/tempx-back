import express from 'express';
import {
    signup,
    requestSignupOTP,
    verifySignupOTP,
    login,
    googleAuth,
    googleCallback,
    getCurrentUser,
    forgotPassword,
    verifyOTP,
    resetPassword
} from '../controllers/authController.js';
import { validateSignup, validateLogin } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import passport from 'passport';

const router = express.Router();

/**
 * @route   POST /auth/signup
 * @desc    Register a new user (legacy - direct signup)
 * @access  Public
 */
router.post('/signup', validateSignup, signup);

/**
 * @route   POST /auth/signup/request-otp
 * @desc    Request OTP for signup verification
 * @access  Public
 */
router.post('/signup/request-otp', requestSignupOTP);

/**
 * @route   POST /auth/signup/verify-otp
 * @desc    Verify OTP and create account
 * @access  Public
 */
router.post('/signup/verify-otp', verifySignupOTP);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get('/google', googleAuth);

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: false
    }),
    googleCallback
);

/**
 * @route   GET /auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP for password reset
 * @access  Public
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password after OTP verification
 * @access  Public
 */
router.post('/reset-password', resetPassword);

export default router;
