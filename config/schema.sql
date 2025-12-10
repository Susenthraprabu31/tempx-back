-- TempMailX Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor: https://app.supabase.com

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Hashed password (nullable for OAuth users)
    name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE, -- For Google OAuth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- ============================================
-- TEMPORARY EMAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS temp_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_temp_emails_user_id ON temp_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_temp_emails_address ON temp_emails(email_address);

-- ============================================
-- EMAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_email VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('received', 'sent')),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_to_email ON emails(to_email);
CREATE INDEX IF NOT EXISTS idx_emails_from_email ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_type ON emails(type);
CREATE INDEX IF NOT EXISTS idx_emails_expires_at ON emails(expires_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Policies for users table (allow service role full access)
CREATE POLICY "Enable all access for service role" ON users
    FOR ALL USING (true);

-- Policies for temp_emails table
CREATE POLICY "Enable all access for service role" ON temp_emails
    FOR ALL USING (true);

-- Policies for emails table
CREATE POLICY "Enable all access for service role" ON emails
    FOR ALL USING (true);

-- ============================================
-- CLEANUP FUNCTION FOR EXPIRED EMAILS
-- ============================================

-- Function to delete expired emails
CREATE OR REPLACE FUNCTION delete_expired_emails()
RETURNS void AS $$
BEGIN
    DELETE FROM emails WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job in Supabase to run this function periodically
-- Or call it from your application

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment below to insert sample data
/*
INSERT INTO users (email, name) VALUES 
    ('test@example.com', 'Test User');
*/
