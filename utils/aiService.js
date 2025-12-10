/**
 * AI Service for Email Generation
 * Uses simple template-based generation (NO API KEY NEEDED!)
 * Works 100% offline and free
 */

/**
 * Email templates for different types of requests
 */
const emailTemplates = {
    sick: {
        keywords: ['sick', 'leave', 'ill', 'unwell', 'health', 'medical', 'doctor'],
        subject: 'Sick Leave Request',
        body: `Dear [Recipient],

I am writing to inform you that I am unable to come to work today due to illness. I am not feeling well and need to take a sick day to recover.

I will keep you updated on my condition and hope to return to work as soon as possible. Please let me know if you need any additional information.

Thank you for your understanding.

Best regards`
    },
    meeting: {
        keywords: ['meeting', 'discuss', 'schedule', 'appointment', 'call', 'conference'],
        subject: 'Meeting Request',
        body: `Dear [Recipient],

I hope this email finds you well. I would like to schedule a meeting with you to discuss important matters.

Please let me know your availability for the coming days, and I will do my best to accommodate your schedule.

Looking forward to hearing from you.

Best regards`
    },
    thankyou: {
        keywords: ['thank', 'thanks', 'appreciate', 'grateful', 'gratitude'],
        subject: 'Thank You',
        body: `Dear [Recipient],

I wanted to take a moment to express my sincere gratitude and appreciation.

Thank you for your time, support, and assistance. It has been truly valuable and I am very grateful.

I look forward to our continued collaboration.

Best regards`
    },
    followup: {
        keywords: ['follow', 'update', 'checking', 'status', 'progress'],
        subject: 'Follow-up',
        body: `Dear [Recipient],

I hope this email finds you well. I am writing to follow up on our previous conversation.

I wanted to check in and see if there are any updates or if you need any additional information from my end.

Please let me know at your earliest convenience.

Best regards`
    },
    application: {
        keywords: ['job', 'application', 'position', 'apply', 'resume', 'cv', 'career'],
        subject: 'Job Application Follow-up',
        body: `Dear [Recipient],

I hope this email finds you well. I am writing to follow up on my recent application for the position.

I remain very interested in this opportunity and would welcome the chance to discuss my qualifications further.

Thank you for considering my application. I look forward to hearing from you.

Best regards`
    },
    apology: {
        keywords: ['sorry', 'apology', 'apologize', 'mistake', 'regret'],
        subject: 'Sincere Apology',
        body: `Dear [Recipient],

I am writing to sincerely apologize for the recent situation. I understand that this may have caused inconvenience, and I take full responsibility.

I assure you that I am taking steps to ensure this does not happen again in the future.

Thank you for your understanding and patience.

Best regards`
    },
    request: {
        keywords: ['request', 'need', 'require', 'asking', 'help', 'assistance'],
        subject: 'Request for Assistance',
        body: `Dear [Recipient],

I hope this email finds you well. I am writing to request your assistance with a matter.

I would greatly appreciate your help and guidance on this. Please let me know if you need any additional information.

Thank you for your time and consideration.

Best regards`
    },
    invitation: {
        keywords: ['invite', 'invitation', 'event', 'party', 'celebration', 'gathering'],
        subject: 'Invitation',
        body: `Dear [Recipient],

I am pleased to invite you to an upcoming event. Your presence would be greatly appreciated.

Please let me know if you will be able to attend, so we can make the necessary arrangements.

I look forward to seeing you there.

Best regards`
    }
};

/**
 * Find the best matching template based on keywords
 */
const findBestTemplate = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    let bestMatch = null;
    let maxMatches = 0;

    for (const [type, template] of Object.entries(emailTemplates)) {
        const matches = template.keywords.filter(keyword =>
            lowerPrompt.includes(keyword)
        ).length;

        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = template;
        }
    }

    // Default template if no match
    if (!bestMatch) {
        return {
            subject: 'Professional Email',
            body: `Dear [Recipient],

I hope this email finds you well. I am writing to you regarding ${prompt}.

Please let me know if you need any additional information or clarification.

Thank you for your time and consideration.

Best regards`
        };
    }

    return bestMatch;
};

/**
 * Generate email content using template matching
 * @param {string} prompt - User's description of the email they want to write
 * @returns {Promise<{success: boolean, subject?: string, body?: string, error?: string}>}
 */
export const generateEmailContent = async (prompt) => {
    try {
        // Validate prompt
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return {
                success: false,
                error: 'Please provide a valid prompt for email generation'
            };
        }

        // Find best matching template
        const template = findBestTemplate(prompt.trim());

        // Add a small delay to simulate API call (makes it feel more realistic)
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            subject: template.subject,
            body: template.body
        };

    } catch (error) {
        console.error('[AI Service Error]', error);
        return {
            success: false,
            error: 'Failed to generate email content. Please try again.'
        };
    }
};

export default {
    generateEmailContent
};
