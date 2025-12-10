import express from 'express';
import {
    createTempEmail,
    getInbox,
    getOutbox,
    getEmailById,
    sendEmail,
    deleteEmail,
    simulateReceive,
    generateAIEmail
} from '../controllers/emailController.js';
import { authenticate } from '../middleware/auth.js';
import { validateEmailSend } from '../middleware/validation.js';

const router = express.Router();

/**
 * All email routes require authentication
 */
router.use(authenticate);

/**
 * @route   POST /email/create
 * @desc    Create a new temporary email address
 * @access  Private
 */
router.post('/create', createTempEmail);

/**
 * @route   GET /email/inbox
 * @desc    Get user's inbox
 * @access  Private
 */
router.get('/inbox', getInbox);

/**
 * @route   GET /email/outbox
 * @desc    Get user's outbox
 * @access  Private
 */
router.get('/outbox', getOutbox);

/**
 * @route   POST /email/send
 * @desc    Send an email
 * @access  Private
 */
router.post('/send', validateEmailSend, sendEmail);

/**
 * @route   POST /email/simulate-receive
 * @desc    Simulate receiving an email (for testing)
 * @access  Private
 */
router.post('/simulate-receive', simulateReceive);

/**
 * @route   POST /email/generate-ai
 * @desc    Generate email content using AI
 * @access  Private
 */
router.post('/generate-ai', generateAIEmail);

/**
 * @route   GET /email/:id
 * @desc    Get email by ID
 * @access  Private
 */
router.get('/:id', getEmailById);

/**
 * @route   DELETE /email/:id
 * @desc    Delete an email
 * @access  Private
 */
router.delete('/:id', deleteEmail);

export default router;
