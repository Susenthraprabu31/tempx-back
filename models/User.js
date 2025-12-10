import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/database.js';

/**
 * User Model for Supabase (PostgreSQL)
 * Provides methods for user CRUD operations
 */

class User {
    /**
     * Create a new user
     */
    static async create({ email, password, name, googleId }) {
        const supabase = getSupabase();

        try {
            // Hash password if provided
            let hashedPassword = null;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(password, salt);
            }

            // Insert user into database
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    name: name?.trim() || email.split('@')[0],
                    google_id: googleId || null
                }])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to find user by ID: ${error.message}`);
        }
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase().trim())
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to find user by email: ${error.message}`);
        }
    }

    /**
     * Find user by Google ID
     */
    static async findByGoogleId(googleId) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('google_id', googleId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to find user by Google ID: ${error.message}`);
        }
    }

    /**
     * Verify user password
     */
    static async verifyPassword(email, password) {
        const supabase = getSupabase();

        try {
            // Get user with password
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase().trim())
                .single();

            if (error || !user || !user.password) {
                return null;
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return null;
            }

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            throw new Error(`Failed to verify password: ${error.message}`);
        }
    }

    /**
     * Update user
     */
    static async update(id, updates) {
        const supabase = getSupabase();

        try {
            // Hash password if being updated
            if (updates.password) {
                const salt = await bcrypt.genSalt(10);
                updates.password = await bcrypt.hash(updates.password, salt);
            }

            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    /**
     * Update user password
     */
    static async updatePassword(id, newPassword) {
        return await this.update(id, { password: newPassword });
    }

    /**
     * Add temporary email to user
     */
    static async addTempEmail(userId, tempEmail) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('temp_emails')
                .insert([{
                    user_id: userId,
                    email_address: tempEmail
                }])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            throw new Error(`Failed to add temp email: ${error.message}`);
        }
    }

    /**
     * Get user's temporary emails
     */
    static async getTempEmails(userId) {
        const supabase = getSupabase();

        try {
            const { data, error } = await supabase
                .from('temp_emails')
                .select('email_address')
                .eq('user_id', userId);

            if (error) throw error;

            return data.map(item => item.email_address);
        } catch (error) {
            throw new Error(`Failed to get temp emails: ${error.message}`);
        }
    }

    /**
     * Convert user to JSON (remove sensitive fields)
     */
    static toJSON(user) {
        if (!user) return null;

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default User;
