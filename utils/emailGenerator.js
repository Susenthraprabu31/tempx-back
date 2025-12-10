import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a random temporary email address
 * @param {string} domain - Email domain (default: tempmailx.com)
 * @returns {string} Generated email address
 */
export const generateTempEmail = (domain = 'tempmailx.com') => {
    const randomString = uuidv4().split('-')[0]; // Use first segment of UUID
    const timestamp = Date.now().toString(36); // Base36 timestamp for uniqueness

    return `temp_${randomString}_${timestamp}@${domain}`;
};

/**
 * Generate multiple temporary email addresses
 * @param {number} count - Number of emails to generate
 * @param {string} domain - Email domain
 * @returns {Array<string>} Array of generated email addresses
 */
export const generateMultipleTempEmails = (count = 1, domain = 'tempmailx.com') => {
    return Array.from({ length: count }, () => generateTempEmail(domain));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export default {
    generateTempEmail,
    generateMultipleTempEmails,
    isValidEmail
};
