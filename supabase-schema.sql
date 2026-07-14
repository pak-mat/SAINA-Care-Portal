-- ==========================================
-- COMPLETE SETUP SCRIPT FOR SUPABASE
-- ==========================================
-- This script drops old tables and recreates them cleanly.
-- Run this in the Supabase SQL Editor.

-- 1. Drop existing tables ( CASCADE cleans up all references automatically )
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "requests" CASCADE;
DROP TABLE IF EXISTS "student_intakes" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 2. Recreate Tables
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "role" TEXT NOT NULL,
  "studentid" TEXT,
  "password" TEXT,
  "status" TEXT DEFAULT 'Available',
  "signature" TEXT,
  "preferences" JSONB DEFAULT '{}'::jsonb,
  "grade" TEXT,
  "gender" TEXT,
  "age" TEXT,
  "risklevel" TEXT DEFAULT 'Low',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE "requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "studentname" TEXT,
  "status" TEXT DEFAULT 'pending',
  "submissiondate" TIMESTAMP WITH TIME ZONE,
  "type" TEXT,
  "choice1" TEXT,
  "reasoncategory" TEXT,
  "details" TEXT,
  "assignedto" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "claimedat" TIMESTAMP WITH TIME ZONE,
  "resolvedby" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "resolvedbyname" TEXT,
  "resolvedat" TIMESTAMP WITH TIME ZONE,
  "counselornotes" TEXT,
  "privatecounselornotes" TEXT,
  "targetschool" TEXT,
  "reason" TEXT,
  "transferformsfile" TEXT,
  "academicrecordsfile" TEXT,
  "iddocumentsfile" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE "messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "counselorid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "senderid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "text" TEXT,
  "imagebase64" TEXT,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "message" TEXT,
  "read" BOOLEAN DEFAULT FALSE,
  "date" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE "student_intakes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentid" UUID REFERENCES "users"("id") ON DELETE CASCADE UNIQUE,
  "family_background" TEXT,
  "medical_history" TEXT,
  "previous_counseling" BOOLEAN DEFAULT false,
  "counseling_goals" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Enable Rules & Fix the Row-Level Security (RLS) Errors
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data or counselors read all" ON "users" FOR SELECT USING (
  id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor' OR auth.role() = 'service_role'
);
CREATE POLICY "Users can update own data" ON "users" FOR UPDATE USING (id = auth.uid() OR auth.role() = 'service_role');

ALTER TABLE "requests" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student read own requests, Counselors read all" ON "requests" FOR SELECT USING (
  studentid = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor' OR auth.role() = 'service_role'
);
CREATE POLICY "Students insert own requests" ON "requests" FOR INSERT WITH CHECK (
  studentid = auth.uid() OR auth.role() = 'service_role'
);
CREATE POLICY "Counselors update requests" ON "requests" FOR UPDATE USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor' OR auth.role() = 'service_role'
);

ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student read own messages, Counselors read all" ON "messages" FOR SELECT USING (
  studentid = auth.uid() OR senderid = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor' OR auth.role() = 'service_role'
);
CREATE POLICY "Users insert own messages" ON "messages" FOR INSERT WITH CHECK (
  senderid = auth.uid() OR auth.role() = 'service_role'
);

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "student_intakes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student read own intake, Counselors read all" ON "student_intakes" FOR SELECT USING (
  studentid = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor' OR auth.role() = 'service_role'
);
CREATE POLICY "Students insert own intake" ON "student_intakes" FOR INSERT WITH CHECK (
  studentid = auth.uid() OR auth.role() = 'service_role'
);
CREATE POLICY "Students update own intake" ON "student_intakes" FOR UPDATE USING (
  studentid = auth.uid() OR auth.role() = 'service_role'
);
CREATE POLICY "Users can read own notifications" ON "notifications" FOR SELECT USING (userid = auth.uid() OR auth.role() = 'service_role');


-- 4. Set up Trigger for Auth Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, studentid)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'studentId'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
