# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: TempMailX
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait for the project to be created (takes ~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** under Project Settings
3. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **Project API keys**:
     - **anon/public**: Copy this key
     - **service_role**: Copy this key (click "Reveal" first)

## Step 3: Update .env File

Open `d:\project-email\backend\.env` and replace the placeholder values:

```env
# Database Configuration (Supabase)
SUPABASE_URL=https://your-actual-project-url.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_KEY=your-actual-service-role-key-here
```

## Step 4: Run SQL Schema

1. In your Supabase dashboard, click on the **SQL Editor** icon in the left sidebar
2. Click "New query"
3. Copy the entire contents of `d:\project-email\backend\config\schema.sql`
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. You should see "Success. No rows returned" - this is normal!

## Step 5: Verify Tables Created

1. Click on the **Table Editor** icon in the left sidebar
2. You should see three tables:
   - `users`
   - `temp_emails`
   - `emails`

## Step 6: Test the Backend

1. Stop the current backend server (Ctrl+C in the terminal)
2. Run `npm start` again
3. You should see "Supabase Connected Successfully"

## Troubleshooting

### "Supabase URL and Anon Key are required"
- Make sure you updated the `.env` file with your actual credentials
- Restart the server after updating `.env`

### "Connection failed"
- Check that your Supabase URL is correct
- Verify your API keys are correct
- Make sure your Supabase project is active

### "Table doesn't exist"
- Make sure you ran the SQL schema in Step 4
- Check the Table Editor to verify tables were created

## Next Steps

Once everything is set up:
1. Test signup at `http://localhost:5173/signup`
2. Test login
3. Test generating temporary emails
4. Check your Supabase dashboard to see data being created!
