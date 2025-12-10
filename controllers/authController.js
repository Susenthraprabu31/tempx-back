import User from '../models/User.js';
import { generateToken } from '../utils/tokenManager.js';
import { generateOTP, storeOTP, storeSignupOTP, verifyOTP as verifyOTPUtil, verifySignupOTP as verifySignupOTPUtil, isOTPVerified, clearOTP, clearSignupOTP } from '../utils/otpService.js';
import { sendPasswordResetOTP, sendSignupOTP } from '../utils/emailService.js';
import passport from 'passport';
import bcrypt from 'bcryptjs';

/**
 * Authentication Controller
 * Handles user signup, login, and Google OAuth
 */

/**
 * @route   POST /auth/signup
 * @desc    Register a new user
 * @access  Public
 */
export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            email: email.toLowerCase().trim(),
            password,
            name: name?.trim()
        });

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: User.toJSON(user),
                token
            }
        });
    } catch (error) {
        console.error('[Signup Error]', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: error.message
        });
    }
};

/**
 * @route   POST /auth/signup/request-otp
 * @desc    Request OTP for signup verification
 * @access  Public
 */
export const requestSignupOTP = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email.toLowerCase().trim());
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password before storing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = generateOTP();

        // Store signup data with OTP
        storeSignupOTP(email, otp, {
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name: name?.trim() || email.split('@')[0]
        }, 10);

        // Send OTP email
        try {
            await sendSignupOTP(email, otp);

            console.log(`[Signup OTP] OTP sent to ${email}`);

            res.status(200).json({
                success: true,
                message: 'Verification code has been sent to your email address. Please check your inbox.'
            });
        } catch (emailError) {
            console.error('[Signup OTP] Email sending failed:', emailError);

            // GRACEFUL DEGRADATION: Log OTP to console for development/testing
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`⚠️  EMAIL SERVICE UNAVAILABLE`);
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 OTP Code: ${otp}`);
            console.log(`⏰ Expires in: 10 minutes`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Still return success so user can proceed
            // In production, you should fix the email service or use a transactional email provider
            res.status(200).json({
                success: true,
                message: 'Verification code generated. Note: Email service is currently unavailable. Please check server logs for your verification code or contact support.',
                warning: 'Email delivery failed - check server logs'
            });
        }

    } catch (error) {
        console.error('[Request Signup OTP Error]', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
};

/**
 * @route   POST /auth/signup/verify-otp
 * @desc    Verify OTP and create account
 * @access  Public
 */
export const verifySignupOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Verify OTP
        const result = verifySignupOTPUtil(email.toLowerCase().trim(), otp);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        // Create user account
        try {
            const user = await User.create(result.userData);

            // Generate JWT token
            const token = generateToken({ userId: user.id, email: user.email });

            // Clear signup OTP
            clearSignupOTP(email);

            console.log(`[Signup OTP] Account created successfully for ${email}`);

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    user: User.toJSON(user),
                    token
                }
            });
        } catch (createError) {
            console.error('[Create User Error]', createError);

            // Handle duplicate key error
            if (createError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to create account. Please try again.'
            });
        }

    } catch (error) {
        console.error('[Verify Signup OTP Error]', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying OTP'
        });
    }
};

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verify credentials
        const user = await User.verifyPassword(email.toLowerCase().trim(), password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: User.toJSON(user),
                token
            }
        });
    } catch (error) {
        console.error('[Login Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login',
            error: error.message
        });
    }
};

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
export const googleCallback = async (req, res) => {
    try {
        // User is attached by passport
        const user = req.user;

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('[Google Callback Error]', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
};

/**
 * @route   GET /auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('[Get Current User Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await User.findByEmail(email.toLowerCase().trim());

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, you will receive an OTP shortly.'
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP with 10 minute expiry
        storeOTP(email, otp, 10);

        // Send OTP email
        try {
            await sendPasswordResetOTP(email, otp);

            console.log(`[Forgot Password] OTP sent to ${email}`);

            res.status(200).json({
                success: true,
                message: 'OTP has been sent to your email address. Please check your inbox.'
            });
        } catch (emailError) {
            console.error('[Forgot Password] Email sending failed:', emailError);

            // GRACEFUL DEGRADATION: Log OTP to console
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`⚠️  EMAIL SERVICE UNAVAILABLE`);
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Password Reset OTP: ${otp}`);
            console.log(`⏰ Expires in: 10 minutes`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            res.status(200).json({
                success: true,
                message: 'OTP generated. Note: Email service is currently unavailable. Please check server logs for your OTP or contact support.',
                warning: 'Email delivery failed - check server logs'
            });
        }

    } catch (error) {
        console.error('[Forgot Password Error]', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
};

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP for password reset
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Verify OTP
        const result = verifyOTPUtil(email.toLowerCase().trim(), otp);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('[Verify OTP Error]', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying OTP'
        });
    }
};

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password after OTP verification
 * @access  Public
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required'
            });
        }

        // Check if OTP was verified
        if (!isOTPVerified(email.toLowerCase().trim())) {
            return res.status(403).json({
                success: false,
                message: 'Please verify OTP before resetting password'
            });
        }

        // Find user
        const user = await User.findByEmail(email.toLowerCase().trim());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password
        await User.updatePassword(user.id, newPassword);

        // Clear OTP
        clearOTP(email);

        console.log(`[Reset Password] Password reset successful for ${email}`);

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('[Reset Password Error]', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting password'
        });
    }
};

export default {
    signup,
    login,
    googleAuth,
    googleCallback,
    getCurrentUser,
    forgotPassword,
    verifyOTP,
    resetPassword
};
