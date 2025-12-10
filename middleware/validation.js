/**
 * Validation middleware for request data
 */

/**
 * Validate signup request
 */
export const validateSignup = (req, res, next) => {
    const { email, password, name } = req.body;

    const errors = [];

    // Email validation
    if (!email || !email.trim()) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }

    // Password validation
    if (!password || !password.trim()) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    // Name validation (optional)
    if (name && name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate login request
 */
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    const errors = [];

    if (!email || !email.trim()) {
        errors.push('Email is required');
    }

    if (!password || !password.trim()) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate email send request
 */
export const validateEmailSend = (req, res, next) => {
    const { from, to, subject, body } = req.body;

    const errors = [];

    if (!from || !from.trim()) {
        errors.push('Sender email (from) is required');
    }

    if (!to || !to.trim()) {
        errors.push('Recipient email (to) is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        errors.push('Invalid recipient email format');
    }

    if (!subject || !subject.trim()) {
        errors.push('Subject is required');
    }

    if (!body || !body.trim()) {
        errors.push('Email body is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

export default {
    validateSignup,
    validateLogin,
    validateEmailSend
};
