/**
 * OTP (One-Time Password) Utility
 * Generates and manages OTPs for password reset and signup verification
 */

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();
const signupOtpStore = new Map(); // Separate storage for signup OTPs

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP with expiration (for password reset)
 * @param {string} email - User's email
 * @param {string} otp - Generated OTP
 * @param {number} expiryMinutes - OTP validity in minutes (default: 10)
 */
export const storeOTP = (email, otp, expiryMinutes = 10) => {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);

    otpStore.set(email.toLowerCase(), {
        otp,
        expiryTime,
        attempts: 0
    });

    console.log(`[OTP] Stored OTP for ${email}, expires in ${expiryMinutes} minutes`);
};

/**
 * Store signup OTP with pending user data
 * @param {string} email - User's email
 * @param {string} otp - Generated OTP
 * @param {Object} userData - Pending user data (email, password, name)
 * @param {number} expiryMinutes - OTP validity in minutes (default: 10)
 */
export const storeSignupOTP = (email, otp, userData, expiryMinutes = 10) => {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);

    signupOtpStore.set(email.toLowerCase(), {
        otp,
        userData,
        expiryTime,
        attempts: 0
    });

    console.log(`[Signup OTP] Stored OTP for ${email}, expires in ${expiryMinutes} minutes`);
};

/**
 * Verify OTP (for password reset)
 * @param {string} email - User's email
 * @param {string} otp - OTP to verify
 * @returns {Object} - Verification result
 */
export const verifyOTP = (email, otp) => {
    const emailKey = email.toLowerCase();
    const stored = otpStore.get(emailKey);

    if (!stored) {
        return {
            success: false,
            message: 'No OTP found. Please request a new one.'
        };
    }

    // Check if OTP has expired
    if (Date.now() > stored.expiryTime) {
        otpStore.delete(emailKey);
        return {
            success: false,
            message: 'OTP has expired. Please request a new one.'
        };
    }

    // Check attempts (max 5 attempts)
    if (stored.attempts >= 5) {
        otpStore.delete(emailKey);
        return {
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.'
        };
    }

    // Verify OTP
    if (stored.otp === otp) {
        // OTP is valid, mark as verified
        otpStore.set(emailKey, {
            ...stored,
            verified: true
        });

        console.log(`[OTP] Successfully verified OTP for ${email}`);

        return {
            success: true,
            message: 'OTP verified successfully'
        };
    } else {
        // Increment failed attempts
        stored.attempts += 1;
        otpStore.set(emailKey, stored);

        const remainingAttempts = 5 - stored.attempts;

        return {
            success: false,
            message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
        };
    }
};

/**
 * Verify signup OTP
 * @param {string} email - User's email
 * @param {string} otp - OTP to verify
 * @returns {Object} - Verification result with user data
 */
export const verifySignupOTP = (email, otp) => {
    const emailKey = email.toLowerCase();
    const stored = signupOtpStore.get(emailKey);

    if (!stored) {
        return {
            success: false,
            message: 'No OTP found. Please request a new one.'
        };
    }

    // Check if OTP has expired
    if (Date.now() > stored.expiryTime) {
        signupOtpStore.delete(emailKey);
        return {
            success: false,
            message: 'OTP has expired. Please request a new one.'
        };
    }

    // Check attempts (max 5 attempts)
    if (stored.attempts >= 5) {
        signupOtpStore.delete(emailKey);
        return {
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.'
        };
    }

    // Verify OTP
    if (stored.otp === otp) {
        console.log(`[Signup OTP] Successfully verified OTP for ${email}`);

        return {
            success: true,
            message: 'OTP verified successfully',
            userData: stored.userData
        };
    } else {
        // Increment failed attempts
        stored.attempts += 1;
        signupOtpStore.set(emailKey, stored);

        const remainingAttempts = 5 - stored.attempts;

        return {
            success: false,
            message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
        };
    }
};

/**
 * Check if OTP is verified for password reset
 * @param {string} email - User's email
 * @returns {boolean}
 */
export const isOTPVerified = (email) => {
    const stored = otpStore.get(email.toLowerCase());
    return stored && stored.verified && Date.now() <= stored.expiryTime;
};

/**
 * Clear OTP after successful password reset
 * @param {string} email - User's email
 */
export const clearOTP = (email) => {
    otpStore.delete(email.toLowerCase());
    console.log(`[OTP] Cleared OTP for ${email}`);
};

/**
 * Clear signup OTP after successful account creation
 * @param {string} email - User's email
 */
export const clearSignupOTP = (email) => {
    signupOtpStore.delete(email.toLowerCase());
    console.log(`[Signup OTP] Cleared OTP for ${email}`);
};

/**
 * Clean up expired OTPs (run periodically)
 */
export const cleanupExpiredOTPs = () => {
    const now = Date.now();
    let cleaned = 0;

    // Clean password reset OTPs
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiryTime) {
            otpStore.delete(email);
            cleaned++;
        }
    }

    // Clean signup OTPs
    for (const [email, data] of signupOtpStore.entries()) {
        if (now > data.expiryTime) {
            signupOtpStore.delete(email);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`[OTP] Cleaned up ${cleaned} expired OTPs`);
    }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

export default {
    generateOTP,
    storeOTP,
    storeSignupOTP,
    verifyOTP,
    verifySignupOTP,
    isOTPVerified,
    clearOTP,
    clearSignupOTP,
    cleanupExpiredOTPs
};
