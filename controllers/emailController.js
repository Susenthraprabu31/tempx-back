import Email from '../models/Email.js';
import User from '../models/User.js';
import { generateTempEmail } from '../utils/emailGenerator.js';
import { generateEmailContent } from '../utils/aiService.js';


/**
 * Email Controller
 * Handles email operations (create temp email, inbox, outbox, send, delete)
 */

/**
 * @route   POST /email/create
 * @desc    Create a new temporary email address
 * @access  Private
 */
export const createTempEmail = async (req, res) => {
    try {
        const userId = req.user.id;

        // Generate temporary email
        const tempEmail = generateTempEmail();

        // Add temp email to user
        await User.addTempEmail(userId, tempEmail);

        res.status(201).json({
            success: true,
            message: 'Temporary email created successfully',
            data: {
                tempEmail,
                expiresIn: `${process.env.EMAIL_EXPIRY_HOURS || 24} hours`
            }
        });
    } catch (error) {
        console.error('[Create Temp Email Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create temporary email',
            error: error.message
        });
    }
};

/**
 * @route   GET /email/inbox
 * @desc    Get user's inbox
 * @access  Private
 */
export const getInbox = async (req, res) => {
    try {
        const userId = req.user.id;

        const emails = await Email.getInbox(userId);

        res.status(200).json({
            success: true,
            data: {
                emails,
                count: emails.length
            }
        });
    } catch (error) {
        console.error('[Get Inbox Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inbox',
            error: error.message
        });
    }
};

/**
 * @route   GET /email/outbox
 * @desc    Get user's outbox
 * @access  Private
 */
export const getOutbox = async (req, res) => {
    try {
        const userId = req.user.id;

        const emails = await Email.getOutbox(userId);

        res.status(200).json({
            success: true,
            data: {
                emails,
                count: emails.length
            }
        });
    } catch (error) {
        console.error('[Get Outbox Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch outbox',
            error: error.message
        });
    }
};

/**
 * @route   GET /email/:id
 * @desc    Get email by ID
 * @access  Private
 */
export const getEmailById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const email = await Email.findById(id);

        if (!email || email.user_id !== userId) {
            return res.status(404).json({
                success: false,
                message: 'Email not found or expired'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                email
            }
        });
    } catch (error) {
        console.error('[Get Email Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch email',
            error: error.message
        });
    }
};

/**
 * @route   POST /email/send
 * @desc    Send an email
 * @access  Private
 */
export const sendEmail = async (req, res) => {
    try {
        const { from, to, subject, body } = req.body;
        const userId = req.user.id;

        // Verify user owns the 'from' temp email
        const tempEmails = await User.getTempEmails(userId);
        if (!tempEmails.includes(from)) {
            return res.status(403).json({
                success: false,
                message: 'You can only send emails from your temporary email addresses'
            });
        }

        // Create email in outbox
        const email = await Email.create({
            from,
            to,
            subject,
            body,
            type: 'sent',
            userId
        });

        res.status(201).json({
            success: true,
            message: 'Email sent successfully',
            data: {
                email
            }
        });
    } catch (error) {
        console.error('[Send Email Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /email/:id
 * @desc    Delete an email
 * @access  Private
 */
export const deleteEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify email belongs to user
        const email = await Email.findById(id);
        if (!email || email.user_id !== userId) {
            return res.status(404).json({
                success: false,
                message: 'Email not found or you are not authorized to delete it'
            });
        }

        await Email.deleteById(id);

        res.status(200).json({
            success: true,
            message: 'Email deleted successfully'
        });
    } catch (error) {
        console.error('[Delete Email Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete email',
            error: error.message
        });
    }
};

/**
 * @route   POST /email/simulate-receive
 * @desc    Simulate receiving an email (for testing)
 * @access  Private
 */
export const simulateReceive = async (req, res) => {
    try {
        const { to, from, subject, body } = req.body;
        const userId = req.user.id;

        // Verify user owns the 'to' temp email
        const tempEmails = await User.getTempEmails(userId);
        if (!tempEmails.includes(to)) {
            return res.status(404).json({
                success: false,
                message: 'Temporary email address not found'
            });
        }

        // Create email in inbox
        const email = await Email.create({
            from: from || 'test@example.com',
            to,
            subject: subject || 'Test Email',
            body: body || 'This is a test email.',
            type: 'received',
            userId
        });

        res.status(201).json({
            success: true,
            message: 'Email received successfully',
            data: {
                email
            }
        });
    } catch (error) {
        console.error('[Simulate Receive Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to simulate email receipt',
            error: error.message
        });
    }
};

/**
 * @route   POST /email/generate-ai
 * @desc    Generate email content using AI
 * @access  Private
 */
export const generateAIEmail = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid prompt for email generation'
            });
        }

        // Limit prompt length to prevent abuse
        if (prompt.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is too long. Please keep it under 500 characters.'
            });
        }

        // Generate email content using AI
        const result = await generateEmailContent(prompt.trim());

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Failed to generate email content'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email content generated successfully',
            data: {
                subject: result.subject,
                body: result.body
            }
        });

    } catch (error) {
        console.error('[Generate AI Email Error]', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating email content',
            error: error.message
        });
    }
};


export default {
    createTempEmail,
    getInbox,
    getOutbox,
    getEmailById,
    sendEmail,
    deleteEmail,
    simulateReceive,
    generateAIEmail
};
