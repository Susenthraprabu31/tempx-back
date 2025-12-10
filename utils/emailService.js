import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service Utility
 * Handles sending email notifications using nodemailer
 */

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 */
const initializeTransporter = () => {
    if (!transporter) {
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;

        if (!emailUser || !emailPassword) {
            console.warn('[Email Service] Email credentials not configured. Email notifications will not work.');
            return null;
        }

        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: emailUser,
                pass: emailPassword
            }
        });

        console.log('[Email Service] Transporter initialized successfully');
    }

    return transporter;
};

/**
 * Send newsletter subscription notification
 * @param {string} subscriberEmail - Email of the subscriber
 * @returns {Promise<Object>} - Result of email send operation
 */
export const sendNewsletterNotification = async (subscriberEmail) => {
    try {
        const transport = initializeTransporter();

        if (!transport) {
            throw new Error('Email service not configured');
        }

        const notificationEmail = process.env.NOTIFICATION_EMAIL || 'susenthraprabusp@gmail.com';
        const timestamp = new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'long'
        });

        const mailOptions = {
            from: `"TempMailX Newsletter" <${process.env.EMAIL_USER}>`,
            to: notificationEmail,
            subject: 'New Newsletter Subscription - TempMailX',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                        }
                        h1 {
                            color: #10b981;
                            margin-top: 0;
                            font-size: 24px;
                        }
                        .info-box {
                            background: #f0fdf4;
                            border-left: 4px solid #10b981;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .email {
                            font-size: 18px;
                            font-weight: bold;
                            color: #059669;
                            word-break: break-all;
                        }
                        .timestamp {
                            color: #6b7280;
                            font-size: 14px;
                            margin-top: 10px;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            text-align: center;
                            color: #6b7280;
                            font-size: 12px;
                        }
                        .badge {
                            display: inline-block;
                            background: #10b981;
                            color: white;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            margin-bottom: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="badge">🎉 NEW SUBSCRIBER</div>
                            <h1>Newsletter Subscription Notification</h1>
                            <p>Great news! You have a new newsletter subscriber for TempMailX.</p>
                            
                            <div class="info-box">
                                <strong>📧 Subscriber Email:</strong><br>
                                <span class="email">${subscriberEmail}</span>
                            </div>
                            
                            <div class="info-box">
                                <strong>🕐 Subscription Time:</strong><br>
                                <span class="timestamp">${timestamp}</span>
                            </div>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>Add this email to your newsletter mailing list</li>
                                <li>Send a welcome email to the subscriber</li>
                                <li>Keep track of your growing subscriber base!</li>
                            </ul>
                            
                            <div class="footer">
                                <p>This is an automated notification from TempMailX Newsletter System</p>
                                <p>© ${new Date().getFullYear()} TempMailX. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
New Newsletter Subscription - TempMailX

Subscriber Email: ${subscriberEmail}
Subscription Time: ${timestamp}

Please add this email to your newsletter mailing list.

---
This is an automated notification from TempMailX Newsletter System
© ${new Date().getFullYear()} TempMailX. All rights reserved.
            `
        };

        const info = await transport.sendMail(mailOptions);

        console.log('[Email Service] Newsletter notification sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'Notification email sent successfully'
        };

    } catch (error) {
        console.error('[Email Service] Error sending newsletter notification:', error);
        throw error;
    }
};

/**
 * Send password reset OTP email
 * @param {string} userEmail - User's email address
 * @param {string} otp - Generated OTP
 * @returns {Promise<Object>} - Result of email send operation
 */
export const sendPasswordResetOTP = async (userEmail, otp) => {
    try {
        const transport = initializeTransporter();

        if (!transport) {
            throw new Error('Email service not configured');
        }

        const mailOptions = {
            from: `"TempMailX Security" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Password Reset OTP - TempMailX',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .content {
                            background: white;
                            padding: 40px;
                            border-radius: 8px;
                            text-align: center;
                        }
                        h1 {
                            color: #10b981;
                            margin-top: 0;
                            font-size: 28px;
                        }
                        .otp-box {
                            background: #f0fdf4;
                            border: 3px dashed #10b981;
                            padding: 30px;
                            margin: 30px 0;
                            border-radius: 8px;
                        }
                        .otp-code {
                            font-size: 48px;
                            font-weight: bold;
                            color: #059669;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .warning {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                            text-align: left;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            text-align: center;
                            color: #6b7280;
                            font-size: 12px;
                        }
                        .badge {
                            display: inline-block;
                            background: #10b981;
                            color: white;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            margin-bottom: 15px;
                        }
                        .expiry {
                            color: #ef4444;
                            font-weight: bold;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="badge">🔐 SECURITY</div>
                            <h1>Password Reset Request</h1>
                            <p>We received a request to reset your password for your TempMailX account.</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your OTP Code:</p>
                                <div class="otp-code">${otp}</div>
                                <p class="expiry" style="margin: 15px 0 0 0;">⏰ Expires in 10 minutes</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>Never share this OTP with anyone</li>
                                    <li>TempMailX will never ask for your OTP</li>
                                    <li>If you didn't request this, please ignore this email</li>
                                    <li>You have 5 attempts to enter the correct OTP</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 30px; color: #6b7280;">
                                If you didn't request a password reset, you can safely ignore this email.
                            </p>
                            
                            <div class="footer">
                                <p>This is an automated email from TempMailX Security</p>
                                <p>© ${new Date().getFullYear()} TempMailX. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Password Reset Request - TempMailX

We received a request to reset your password for your TempMailX account.

Your OTP Code: ${otp}

⏰ This OTP will expire in 10 minutes.

Security Notice:
- Never share this OTP with anyone
- TempMailX will never ask for your OTP
- If you didn't request this, please ignore this email
- You have 5 attempts to enter the correct OTP

If you didn't request a password reset, you can safely ignore this email.

---
This is an automated email from TempMailX Security
© ${new Date().getFullYear()} TempMailX. All rights reserved.
            `
        };

        const info = await transport.sendMail(mailOptions);

        console.log('[Email Service] Password reset OTP sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'OTP email sent successfully'
        };

    } catch (error) {
        console.error('[Email Service] Error sending OTP email:', error);
        throw error;
    }
};

/**
 * Send signup verification OTP email
 * @param {string} userEmail - User's email address
 * @param {string} otp - Generated OTP
 * @returns {Promise<Object>} - Result of email send operation
 */
export const sendSignupOTP = async (userEmail, otp) => {
    try {
        const transport = initializeTransporter();

        if (!transport) {
            throw new Error('Email service not configured');
        }

        const mailOptions = {
            from: `"TempMailX" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Verify Your Email - TempMailX',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .content {
                            background: white;
                            padding: 40px;
                            border-radius: 8px;
                            text-align: center;
                        }
                        h1 {
                            color: #10b981;
                            margin-top: 0;
                            font-size: 28px;
                        }
                        .welcome {
                            font-size: 18px;
                            color: #6b7280;
                            margin-bottom: 30px;
                        }
                        .otp-box {
                            background: #f0fdf4;
                            border: 3px dashed #10b981;
                            padding: 30px;
                            margin: 30px 0;
                            border-radius: 8px;
                        }
                        .otp-code {
                            font-size: 48px;
                            font-weight: bold;
                            color: #059669;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .info {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                            text-align: left;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            text-align: center;
                            color: #6b7280;
                            font-size: 12px;
                        }
                        .badge {
                            display: inline-block;
                            background: #10b981;
                            color: white;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            margin-bottom: 15px;
                        }
                        .expiry {
                            color: #ef4444;
                            font-weight: bold;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="badge">✉️ EMAIL VERIFICATION</div>
                            <h1>Welcome to TempMailX!</h1>
                            <p class="welcome">
                                Thank you for signing up. Please verify your email address to complete your registration.
                            </p>
                            
                            <div class="otp-box">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Verification Code:</p>
                                <div class="otp-code">${otp}</div>
                                <p class="expiry" style="margin: 15px 0 0 0;">⏰ Expires in 10 minutes</p>
                            </div>
                            
                            <div class="info">
                                <strong>⚠️ Important:</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>Never share this code with anyone</li>
                                    <li>TempMailX will never ask for your verification code</li>
                                    <li>If you didn't sign up, please ignore this email</li>
                                    <li>You have 5 attempts to enter the correct code</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 30px; color: #6b7280;">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                            
                            <div class="footer">
                                <p>This is an automated email from TempMailX</p>
                                <p>© ${new Date().getFullYear()} TempMailX. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Welcome to TempMailX!

Thank you for signing up. Please verify your email address to complete your registration.

Your Verification Code: ${otp}

⏰ This code will expire in 10 minutes.

Important:
- Never share this code with anyone
- TempMailX will never ask for your verification code
- If you didn't sign up, please ignore this email
- You have 5 attempts to enter the correct code

If you didn't create an account, you can safely ignore this email.

---
This is an automated email from TempMailX
© ${new Date().getFullYear()} TempMailX. All rights reserved.
            `
        };

        const info = await transport.sendMail(mailOptions);

        console.log('[Email Service] Signup verification OTP sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            message: 'Verification email sent successfully'
        };

    } catch (error) {
        console.error('[Email Service] Error sending signup OTP email:', error);
        throw error;
    }
};

/**
 * Verify email service connection
 * @returns {Promise<boolean>}
 */
export const verifyEmailService = async () => {
    try {
        const transport = initializeTransporter();

        if (!transport) {
            return false;
        }

        await transport.verify();
        console.log('[Email Service] Connection verified successfully');
        return true;
    } catch (error) {
        console.error('[Email Service] Verification failed:', error.message);
        return false;
    }
};

export default {
    sendNewsletterNotification,
    sendPasswordResetOTP,
    sendSignupOTP,
    verifyEmailService
};
