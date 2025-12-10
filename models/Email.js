import { getSupabase } from '../config/database.js';

/**
 * Email Model for Supabase (PostgreSQL)
 * Provides methods for email CRUD operations
 */

class Email {
    /**
     * Create a new email
     */
    static async create({ from, to, subject, body, type, userId }) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('emails')
                .insert([{
                    from_email: from,
                    to_email: to,
                    subject: subject || '',
                    body: body || '',
                    type: type, // 'sent' or 'received'
                    user_id: userId
                }])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to create email: ${error.message}`);
        }
    }

    /**
     * Find email by ID
     */
    static async findById(id) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('emails')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to find email by ID: ${error.message}`);
        }
    }

    /**
     * Get user's inbox (received emails)
     */
    static async getInbox(userId) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('emails')
                .select('*')
                .eq('user_id', userId)
                .eq('type', 'received')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            throw new Error(`Failed to get inbox: ${error.message}`);
        }
    }

    /**
     * Get user's outbox (sent emails)
     */
    static async getOutbox(userId) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('emails')
                .select('*')
                .eq('user_id', userId)
                .eq('type', 'sent')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            throw new Error(`Failed to get outbox: ${error.message}`);
        }
    }

    /**
     * Delete email by ID
     */
    static async deleteById(id) {
        const supabase = getSupabase();

        try {
            const { error } = await supabase
                .from('emails')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            throw new Error(`Failed to delete email: ${error.message}`);
        }
    }

    /**
     * Delete expired emails
     */
    static async deleteExpired() {
        const supabase = getSupabase();

        try {
            const { error } = await supabase
                .from('emails')
                .delete()
                .lt('expires_at', new Date().toISOString());

            if (error) throw error;

            return true;
        } catch (error) {
            throw new Error(`Failed to delete expired emails: ${error.message}`);
        }
    }

    /**
     * Find emails by recipient address
     */
    static async findByRecipient(email) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('emails')
                .select('*')
                .eq('to_email', email)
                .eq('type', 'received')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            throw new Error(`Failed to find emails by recipient: ${error.message}`);
        }
    }
}

export default Email;
