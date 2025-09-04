-- GamePlannr MVP Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  sport TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'mentor')),
  bio TEXT,
  phone TEXT,
  experience TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Future tables for upcoming milestones:

-- Session requests table (Milestone 3)
CREATE TABLE session_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_date DATE,
  preferred_time TIME,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (Milestone 3)
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_request_id UUID REFERENCES session_requests(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_date DATE,
  scheduled_time TIME,
  location TEXT,
  status TEXT DEFAULT 'awaiting_payment' CHECK (status IN ('awaiting_payment', 'paid', 'confirmed', 'completed', 'cancelled')),
  stripe_payment_intent_id TEXT,
  amount INTEGER, -- Amount in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table (Milestone 5)
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for future tables
ALTER TABLE session_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for session_requests
CREATE POLICY "Users can view session requests they're involved in" ON session_requests 
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = mentor_id);
CREATE POLICY "Parents can create session requests" ON session_requests 
  FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Mentors can update session requests" ON session_requests 
  FOR UPDATE USING (auth.uid() = mentor_id);

-- Create policies for sessions
CREATE POLICY "Users can view sessions they're involved in" ON sessions 
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = mentor_id);
CREATE POLICY "System can create sessions" ON sessions 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sessions they're involved in" ON sessions 
  FOR UPDATE USING (auth.uid() = parent_id OR auth.uid() = mentor_id);

-- Create policies for ratings
CREATE POLICY "Users can view ratings for sessions they're involved in" ON ratings 
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = mentor_id);
CREATE POLICY "Parents can create ratings" ON ratings 
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Create triggers for future tables
CREATE TRIGGER update_session_requests_updated_at BEFORE UPDATE ON session_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
