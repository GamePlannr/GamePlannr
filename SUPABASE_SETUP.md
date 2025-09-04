# Supabase Setup Instructions

## Current Status
✅ **Project URL**: `https://jsiyenbnoxeuimiytuzq.supabase.co`  
✅ **Anon Key**: Configured and ready

## Next Steps

### 1. Get the Anon Key
The client provided the **Service Role Key**, but we need the **Anon Key** for the frontend.

**To get the Anon Key:**
1. Go to [https://jsiyenbnoxeuimiytuzq.supabase.co](https://jsiyenbnoxeuimiytuzq.supabase.co)
2. Click on "Settings" in the left sidebar
3. Click on "API" 
4. Copy the **"anon public"** key (not the service role key)

### 2. Update Environment Variables
Once you have the anon key, update your `.env` file:

```env
REACT_APP_SUPABASE_URL=https://jsiyenbnoxeuimiytuzq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaXllbmJub3hldWltaXl0dXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjYwMjgsImV4cCI6MjA3MjUwMjAyOH0.YNWLd_9pwztYASjbwRINBIAbT9eYu1YFe4W4zp5evt0
```

### 3. Set Up Database Schema
Run the SQL from `database-schema.sql` in your Supabase SQL Editor:

1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to create the tables

### 4. Test the Application
After setting up the anon key and database schema:
1. Restart the development server: `npm start`
2. Try signing up as a Parent or Mentor
3. Test the authentication flow

## Security Note
The client mentioned they will rotate the service role key after setup. Make sure to:
- Use only the anon key in the frontend
- Never expose the service role key in client-side code
- Keep the anon key in environment variables

## Current Credentials
- **Project URL**: `https://jsiyenbnoxeuimiytuzq.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaXllbmJub3hldWltaXl0dXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjYwMjgsImV4cCI6MjA3MjUwMjAyOH0.YNWLd_9pwztYASjbwRINBIAbT9eYu1YFe4W4zp5evt0`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaXllbmJub3hldWltaXl0dXpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjkyNjAyOCwiZXhwIjoyMDcyNTAyMDI4fQ.x7IjkXowu1DMGz4niLZJOFgKlKOQ44dSlZ5nmGr3tmU` (DO NOT USE IN FRONTEND)
