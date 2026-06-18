-- 1. Create a definitive public policy that allows anonymous use without blocking
DROP POLICY IF EXISTS "public_anon_users" ON "users";
CREATE POLICY "public_anon_users" ON "users" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_anon_requests" ON "requests";
CREATE POLICY "public_anon_requests" ON "requests" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_anon_messages" ON "messages";
CREATE POLICY "public_anon_messages" ON "messages" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_anon_notifications" ON "notifications";
CREATE POLICY "public_anon_notifications" ON "notifications" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Ensure Demo Users exist
INSERT INTO "users" ("id", "name", "email", "role", "studentid", "password", "status")
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Adam Shah', 'adam@demo.com', 'student', 'ST-001', 'dummy', 'Available'),
  ('123e4567-e89b-12d3-a456-426614174001', 'Cik Nor', 'nor@demo.com', 'counselor', NULL, 'dummy', 'Available')
ON CONFLICT ("email") DO UPDATE SET "role" = EXCLUDED."role", "password" = EXCLUDED."password";
