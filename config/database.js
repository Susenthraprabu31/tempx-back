import { createClient } from '@supabase/supabase-js';
import config from './env.js';

/**
 * Supabase Database Connection
 * Handles connection and provides database client
 */

let supabase = null;

export const connectDatabase = async () => {
    try {
        if (!config.database.url || !config.database.anonKey) {
            throw new Error('Supabase URL and Anon Key are required. Please check your .env file.');
        }

        // Create Supabase client
        supabase = createClient(
            config.database.url,
            config.database.serviceKey || config.database.anonKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: false
                }
            }
        );

        // Test connection by querying a simple table
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });

        if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet (acceptable)
            console.warn('[Supabase] Warning:', error.message);
        }

        console.log(`
╔═══════════════════════════════════════════╗
║     Supabase Connected Successfully       ║
╚═══════════════════════════════════════════╝
    `);

        return supabase;
    } catch (error) {
        console.error('[Supabase] Connection failed:', error.message);
        throw error;
    }
};

export const getSupabase = () => {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Call connectDatabase() first.');
    }
    return supabase;
};

export const disconnectDatabase = async () => {
    // Supabase doesn't require explicit disconnection
    console.log('[Supabase] Connection closed');
    supabase = null;
};

export default {
    connectDatabase,
    getSupabase,
    disconnectDatabase
};
