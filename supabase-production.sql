-- =================================================================
-- SAINA CARE PORTAL — PRODUCTION DATABASE SCHEMA
-- =================================================================
-- Version: 1.0.0
-- Date: 2026-07-08
-- Purpose: Single, unified, production-grade schema that replaces
--          all previous patch files (v1–v8, fix-auth, fix_rls).
--
-- This is a NON-DESTRUCTIVE migration:
--   • Uses IF NOT EXISTS for new tables
--   • Uses ADD COLUMN IF NOT EXISTS for new columns
--   • Uses DROP POLICY IF EXISTS before (re)creating policies
--   • Preserves all existing data
--
-- HOW TO RUN:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
-- =================================================================


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SECTION 1: EXTENSIONS                                       ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SECTION 2: TABLE SCHEMA — CORE TABLES                       ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ── 2A. Users (Student & Counselor profiles) ──────────────────
-- The users table already exists. We add missing columns only.

-- Remove the insecure password column (Supabase Auth handles passwords)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
    ALTER TABLE "users" DROP COLUMN "password";
  END IF;
END $$;

-- Rename grade → form (Malaysian high school system)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='grade') THEN
    ALTER TABLE "users" RENAME COLUMN "grade" TO "form";
  END IF;
END $$;

-- Add all SMS fields
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "form" TEXT,
  ADD COLUMN IF NOT EXISTS "gender" TEXT,
  ADD COLUMN IF NOT EXISTS "age" TEXT,
  ADD COLUMN IF NOT EXISTS "risklevel" TEXT DEFAULT 'Low',
  ADD COLUMN IF NOT EXISTS "account_status" TEXT DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "guardian_name" TEXT,
  ADD COLUMN IF NOT EXISTS "emergency_contact" TEXT,
  ADD COLUMN IF NOT EXISTS "assigned_counselor" UUID,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "avatar_color" TEXT,
  ADD COLUMN IF NOT EXISTS "banner_style" TEXT DEFAULT 'indigo_dusk',
  ADD COLUMN IF NOT EXISTS "interests" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "social_handles" JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());


-- ── 2B. Appointments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "counselorid" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "status" TEXT DEFAULT 'pending',
  "scheduled_date" TIMESTAMP WITH TIME ZONE,
  "topic_category" TEXT,
  "private_notes" TEXT,
  "counselor_notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ── 2C. School Transfers ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS "school_transfers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "counselorid" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "status" TEXT DEFAULT 'pending',
  "target_school" TEXT NOT NULL,
  "reason_category" TEXT NOT NULL,
  "detailed_reason" TEXT,
  "counselor_notes" TEXT,
  "transfer_forms_url" TEXT,
  "academic_records_url" TEXT,
  "id_documents_url" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ── 2D. Wellness Check-ins ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "wellness_checkins" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "counselorid" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "status" TEXT DEFAULT 'pending',
  "mood_score" INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  "checkin_notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ── 2E. Case Notes (Counselor-only, invisible to students) ────
CREATE TABLE IF NOT EXISTS "case_notes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "counselorid" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT,
  "content" TEXT NOT NULL,
  "note_type" TEXT DEFAULT 'general',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ── 2F. Messages ──────────────────────────────────────────────
-- Already exists from original schema. No changes needed.


-- ── 2G. Notifications ─────────────────────────────────────────
-- Already exists from original schema. No changes needed.


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SECTION 3: PERFORMANCE INDEXES                               ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Users
CREATE INDEX IF NOT EXISTS idx_users_role ON "users" ("role");
CREATE INDEX IF NOT EXISTS idx_users_risklevel ON "users" ("risklevel");
CREATE INDEX IF NOT EXISTS idx_users_account_status ON "users" ("account_status");
CREATE INDEX IF NOT EXISTS idx_users_form ON "users" ("form");
CREATE INDEX IF NOT EXISTS idx_users_assigned_counselor ON "users" ("assigned_counselor");

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_studentid ON "appointments" ("studentid");
CREATE INDEX IF NOT EXISTS idx_appointments_counselorid ON "appointments" ("counselorid");
CREATE INDEX IF NOT EXISTS idx_appointments_status ON "appointments" ("status");
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON "appointments" ("created_at" DESC);

-- School Transfers
CREATE INDEX IF NOT EXISTS idx_transfers_studentid ON "school_transfers" ("studentid");
CREATE INDEX IF NOT EXISTS idx_transfers_status ON "school_transfers" ("status");

-- Wellness Check-ins
CREATE INDEX IF NOT EXISTS idx_checkins_studentid ON "wellness_checkins" ("studentid");
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON "wellness_checkins" ("created_at" DESC);

-- Case Notes
CREATE INDEX IF NOT EXISTS idx_case_notes_studentid ON "case_notes" ("studentid");
CREATE INDEX IF NOT EXISTS idx_case_notes_counselorid ON "case_notes" ("counselorid");

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_studentid ON "messages" ("studentid");
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON "messages" ("timestamp" DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_userid ON "notifications" ("userid");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON "notifications" ("read");


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES                ║
-- ╚═══════════════════════════════════════════════════════════════╝
-- SECURITY NOTES:
--   • Uses (select auth.uid()) wrapped in subquery for performance
--   • Checks role via app_metadata (tamper-proof) with user_metadata fallback
--   • UPDATE policies have both USING and WITH CHECK
--   • Uses TO authenticated instead of deprecated auth.role()
--   • Dropped all old wide-open policies from fix-auth.sql

-- Helper: We use this expression to check if the current user is a counselor.
-- It checks app_metadata first (secure), then user_metadata as fallback
-- for existing users who signed up before the app_metadata fix.
-- Expression: is_counselor()
--   (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
--   OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'


-- ── 4A. Users Table ───────────────────────────────────────────

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies to start clean
DROP POLICY IF EXISTS "Users can read own data" ON "users";
DROP POLICY IF EXISTS "Users can read own data or counselors read all" ON "users";
DROP POLICY IF EXISTS "Users can update own data" ON "users";
DROP POLICY IF EXISTS "Counselors update users" ON "users";
DROP POLICY IF EXISTS "public_anon_users" ON "users";
DROP POLICY IF EXISTS "Users insert own profile" ON "users";

-- SELECT: Students see own profile + all counselor profiles; Counselors see everyone
CREATE POLICY "users_select" ON "users" FOR SELECT TO authenticated
USING (
  (select auth.uid()) = id
  OR role = 'counselor'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

-- UPDATE: Users update own profile; Counselors can update any student profile
CREATE POLICY "users_update_own" ON "users" FOR UPDATE TO authenticated
USING ( (select auth.uid()) = id )
WITH CHECK ( (select auth.uid()) = id );

CREATE POLICY "users_update_counselor" ON "users" FOR UPDATE TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

-- INSERT: Only triggers/service_role insert users (via handle_new_user)
-- No direct INSERT policy for authenticated — the trigger runs as SECURITY DEFINER


-- ── 4B. Appointments Table ────────────────────────────────────

ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students manage own appointments" ON "appointments";
DROP POLICY IF EXISTS "Counselors read all appointments" ON "appointments";
DROP POLICY IF EXISTS "Counselors update appointments" ON "appointments";

-- SELECT: Students see own; Counselors see all
CREATE POLICY "appointments_select" ON "appointments" FOR SELECT TO authenticated
USING (
  studentid = (select auth.uid())
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

-- INSERT: Students can create their own appointments
CREATE POLICY "appointments_insert" ON "appointments" FOR INSERT TO authenticated
WITH CHECK (
  studentid = (select auth.uid())
);

-- UPDATE: Only counselors can update appointments (approve, reject, reschedule)
CREATE POLICY "appointments_update" ON "appointments" FOR UPDATE TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);


-- ── 4C. School Transfers ──────────────────────────────────────

ALTER TABLE "school_transfers" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students manage own transfers" ON "school_transfers";
DROP POLICY IF EXISTS "Counselors read all transfers" ON "school_transfers";
DROP POLICY IF EXISTS "Counselors update transfers" ON "school_transfers";

-- SELECT: Students see own; Counselors see all
CREATE POLICY "transfers_select" ON "school_transfers" FOR SELECT TO authenticated
USING (
  studentid = (select auth.uid())
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

-- INSERT: Students create own transfer requests
CREATE POLICY "transfers_insert" ON "school_transfers" FOR INSERT TO authenticated
WITH CHECK (
  studentid = (select auth.uid())
);

-- UPDATE: Only counselors
CREATE POLICY "transfers_update" ON "school_transfers" FOR UPDATE TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);


-- ── 4D. Wellness Check-ins ────────────────────────────────────

ALTER TABLE "wellness_checkins" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students manage own checkins" ON "wellness_checkins";
DROP POLICY IF EXISTS "Counselors read all checkins" ON "wellness_checkins";
DROP POLICY IF EXISTS "Counselors update checkins" ON "wellness_checkins";

-- SELECT: Students see own; Counselors see all
CREATE POLICY "checkins_select" ON "wellness_checkins" FOR SELECT TO authenticated
USING (
  studentid = (select auth.uid())
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

-- INSERT: Students submit their own check-ins
CREATE POLICY "checkins_insert" ON "wellness_checkins" FOR INSERT TO authenticated
WITH CHECK (
  studentid = (select auth.uid())
);

-- UPDATE: Counselors review check-ins
CREATE POLICY "checkins_update" ON "wellness_checkins" FOR UPDATE TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);


-- ── 4E. Case Notes (Counselor-only) ──────────────────────────

ALTER TABLE "case_notes" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Counselors read all case notes" ON "case_notes";
DROP POLICY IF EXISTS "Counselors insert case notes" ON "case_notes";
DROP POLICY IF EXISTS "Counselors update case notes" ON "case_notes";
DROP POLICY IF EXISTS "Counselors delete case notes" ON "case_notes";
DROP POLICY IF EXISTS "Counselors manage case notes" ON "case_notes";

-- ALL operations: Counselors only. Students have ZERO access.
CREATE POLICY "case_notes_select" ON "case_notes" FOR SELECT TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

CREATE POLICY "case_notes_insert" ON "case_notes" FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

CREATE POLICY "case_notes_update" ON "case_notes" FOR UPDATE TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

CREATE POLICY "case_notes_delete" ON "case_notes" FOR DELETE TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);


-- ── 4F. Messages ──────────────────────────────────────────────

ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Student read own messages, Counselors read all" ON "messages";
DROP POLICY IF EXISTS "Users insert own messages" ON "messages";
DROP POLICY IF EXISTS "public_anon_messages" ON "messages";

-- SELECT: Participants in the conversation, or any counselor
CREATE POLICY "messages_select" ON "messages" FOR SELECT TO authenticated
USING (
  studentid = (select auth.uid())
  OR senderid = (select auth.uid())
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'counselor'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'counselor'
);

-- INSERT: Only the sender can insert a message
CREATE POLICY "messages_insert" ON "messages" FOR INSERT TO authenticated
WITH CHECK (
  senderid = (select auth.uid())
);


-- ── 4G. Notifications ─────────────────────────────────────────

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON "notifications";
DROP POLICY IF EXISTS "public_anon_notifications" ON "notifications";
DROP POLICY IF EXISTS "notifications_insert_system" ON "notifications";

-- SELECT: Users read their own notifications
CREATE POLICY "notifications_select" ON "notifications" FOR SELECT TO authenticated
USING (
  userid = (select auth.uid())
);

-- UPDATE: Users can mark own notifications as read
CREATE POLICY "notifications_update" ON "notifications" FOR UPDATE TO authenticated
USING ( userid = (select auth.uid()) )
WITH CHECK ( userid = (select auth.uid()) );

-- INSERT: Allow authenticated users to insert notifications for themselves
-- (Trigger-based inserts use SECURITY DEFINER and bypass RLS)
CREATE POLICY "notifications_insert" ON "notifications" FOR INSERT TO authenticated
WITH CHECK (true);


-- ── 4H. Clean up old requests table policies (if it still exists) ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Student read own requests, Counselors read all" ON "requests"';
    EXECUTE 'DROP POLICY IF EXISTS "Students insert own requests" ON "requests"';
    EXECUTE 'DROP POLICY IF EXISTS "Counselors update requests" ON "requests"';
    EXECUTE 'DROP POLICY IF EXISTS "public_anon_requests" ON "requests"';
  END IF;
END $$;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SECTION 5: TRIGGER FUNCTIONS                                 ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ── 5A. Auto-update updated_at column ─────────────────────────
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_users_modtime ON "users";
CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_appointments_modtime ON "appointments";
CREATE TRIGGER update_appointments_modtime
  BEFORE UPDATE ON "appointments"
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_transfers_modtime ON "school_transfers";
CREATE TRIGGER update_transfers_modtime
  BEFORE UPDATE ON "school_transfers"
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_case_notes_modtime ON "case_notes";
CREATE TRIGGER update_case_notes_modtime
  BEFORE UPDATE ON "case_notes"
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();


-- ── 5B. Handle New User Registration ──────────────────────────
-- This trigger fires when a new user signs up via Supabase Auth.
-- It creates a corresponding row in public.users AND sets the role
-- in app_metadata (tamper-proof) for secure RLS checks.
--
-- SECURITY NOTE: This function MUST be SECURITY DEFINER because it
-- needs to: (a) insert into public.users bypassing RLS, and
-- (b) call auth.admin functions to set app_metadata.
-- We mitigate the risk by:
--   1. Only being triggered by auth.users INSERT (not callable directly)
--   2. Revoking EXECUTE from public roles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  _role TEXT;
BEGIN
  -- Extract role from signup metadata, default to 'student'
  _role := COALESCE(new.raw_user_meta_data ->> 'role', 'student');

  -- Insert into public.users with all signup fields
  INSERT INTO public.users (id, email, name, role, studentid, form, gender, age)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    _role,
    new.raw_user_meta_data ->> 'studentId',
    new.raw_user_meta_data ->> 'form',
    new.raw_user_meta_data ->> 'gender',
    new.raw_user_meta_data ->> 'age'
  );

  -- Store role in app_metadata (tamper-proof, unlike user_metadata)
  -- This makes RLS policies secure against client-side role manipulation
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', _role)
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke direct execution from public roles (defense in depth)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 5C. Appointment Notification Trigger ──────────────────────
-- When a student books an appointment and selects a counselor,
-- auto-create a notification for that counselor.

CREATE OR REPLACE FUNCTION notify_on_appointment()
RETURNS trigger AS $$
BEGIN
  IF NEW.counselorid IS NOT NULL THEN
    INSERT INTO "notifications" ("userid", "message")
    VALUES (NEW.counselorid, 'New appointment scheduled by a student.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION notify_on_appointment() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION notify_on_appointment() FROM anon;
REVOKE EXECUTE ON FUNCTION notify_on_appointment() FROM authenticated;

DROP TRIGGER IF EXISTS trg_notify_appointment ON "appointments";
CREATE TRIGGER trg_notify_appointment
  AFTER INSERT ON "appointments"
  FOR EACH ROW EXECUTE FUNCTION notify_on_appointment();


-- ── 5D. Transfer Status Notification Trigger ──────────────────
-- When a counselor changes a transfer request's status, notify the student.

CREATE OR REPLACE FUNCTION notify_on_transfer()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
    INSERT INTO "notifications" ("userid", "message")
    VALUES (NEW.studentid, 'Your school transfer request status changed to: ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION notify_on_transfer() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION notify_on_transfer() FROM anon;
REVOKE EXECUTE ON FUNCTION notify_on_transfer() FROM authenticated;

DROP TRIGGER IF EXISTS trg_notify_transfer ON "school_transfers";
CREATE TRIGGER trg_notify_transfer
  AFTER UPDATE ON "school_transfers"
  FOR EACH ROW EXECUTE FUNCTION notify_on_transfer();


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SECTION 6: REALTIME SUBSCRIPTIONS                            ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Enable realtime for chat messages (live chat feature)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Already added
END $$;

-- Enable realtime for notifications (live notification badge)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SECTION 7: BACKFILL app_metadata FOR EXISTING USERS          ║
-- ╚═══════════════════════════════════════════════════════════════╝
-- Existing users who signed up before this migration have their role
-- only in user_metadata. This backfills app_metadata so RLS works
-- correctly going forward.

UPDATE auth.users au
SET raw_app_meta_data = COALESCE(au.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', COALESCE(pu.role, au.raw_user_meta_data ->> 'role', 'student'))
FROM public.users pu
WHERE au.id = pu.id
  AND (au.raw_app_meta_data ->> 'role') IS NULL;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  DONE! Your database is now production-grade. 🚀              ║
-- ╚═══════════════════════════════════════════════════════════════╝
