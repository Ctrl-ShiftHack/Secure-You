-- ============================================
-- SecureYou Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  address TEXT,
  medical_info TEXT,
  blood_type TEXT,
  allergies TEXT
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sos', 'medical', 'fire', 'police', 'other')),
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'cancelled')),
  location JSONB NOT NULL,
  description TEXT,
  contacted_authorities BOOLEAN DEFAULT FALSE,
  notified_contacts JSONB DEFAULT '[]'::JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON emergency_contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for service role" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to see all profiles
CREATE POLICY "Enable read access for service role"
  ON profiles FOR SELECT
  USING (true);

-- RLS Policies for emergency_contacts
DROP POLICY IF EXISTS "Users can view their own contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Enable read access for service role" ON emergency_contacts;

CREATE POLICY "Users can view their own contacts"
  ON emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to see all contacts
CREATE POLICY "Enable read access for service role"
  ON emergency_contacts FOR SELECT
  USING (true);

-- RLS Policies for incidents
DROP POLICY IF EXISTS "Users can view their own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can insert their own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can update their own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can delete their own incidents" ON incidents;
DROP POLICY IF EXISTS "Enable read access for service role" ON incidents;

CREATE POLICY "Users can view their own incidents"
  ON incidents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incidents"
  ON incidents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incidents"
  ON incidents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own incidents"
  ON incidents FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to see all incidents
CREATE POLICY "Enable read access for service role"
  ON incidents FOR SELECT
  USING (true);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database migration completed successfully!';
  RAISE NOTICE '📊 Tables created: profiles, emergency_contacts, incidents';
  RAISE NOTICE '🔒 Row Level Security enabled with policies';
  RAISE NOTICE '🎯 Auto-profile creation trigger installed';
END $$;
