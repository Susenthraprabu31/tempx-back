import express from 'express';
import { sendNewsletterNotification } from '../utils/emailService.js';

const router = express.Router();

/**
 * @route   POST /newsletter/subscribe
 * @desc    Subscribe to newsletter and send notification
 * @access  Public
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Send notification email
        try {
            await sendNewsletterNotification(email);

            return res.status(200).json({
                success: true,
                message: 'Thank you for subscribing! You will receive updates soon.',
                data: {
                    email: email,
                    subscribedAt: new Date().toISOString()
                }
            });

        } catch (emailError) {
            console.error('[Newsletter] Email sending failed:', emailError);

            // Check if it's a configuration error
            if (emailError.message.includes('not configured')) {
                return res.status(503).json({
                    success: false,
                    message: 'Email service is currently unavailable. Please try again later.'
                });
            }

            // Other email errors
            return res.status(500).json({
                success: false,
                message: 'Failed to process subscription. Please try again later.'
            });
        }

    } catch (error) {
        console.error('[Newsletter] Subscription error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your subscription'
        });
    }
});

/**
 * @route   GET /newsletter/health
 * @desc    Check newsletter service health
 * @access  Public
 */
router.get('/health', (req, res) => {
    const isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

    res.status(200).json({
        success: true,
        message: 'Newsletter service is running',
        configured: isConfigured,
        notificationEmail: process.env.NOTIFICATION_EMAIL || 'susenthraprabusp@gmail.com'
    });
});

export default router;
