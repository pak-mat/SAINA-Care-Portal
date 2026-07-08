-- ==========================================
-- SAINA CARE PORTAL - SOCIAL EXTENSION SCHEMA
-- ==========================================
-- This script creates the missing social networking and messaging tables.
-- Run this in the Supabase SQL Editor.

-- 1. Friends & Connections
CREATE TABLE IF NOT EXISTS "friends" (
  "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "friend_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("user_id", "friend_id")
);

CREATE TABLE IF NOT EXISTS "friend_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sender_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "receiver_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "status" TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE("sender_id", "receiver_id")
);

CREATE TABLE IF NOT EXISTS "kudos" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sender_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "receiver_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE("sender_id", "receiver_id")
);

-- 2. Group Chats
CREATE TABLE IF NOT EXISTS "group_chats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS "group_members" (
  "group_id" UUID REFERENCES "group_chats"("id") ON DELETE CASCADE,
  "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "joined_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("group_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "group_messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" UUID REFERENCES "group_chats"("id") ON DELETE CASCADE,
  "sender_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "sender_name" TEXT,
  "text" TEXT NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Timeline / Social Feed
CREATE TABLE IF NOT EXISTS "timeline_posts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "author_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "author_name" TEXT,
  "author_avatar_color" TEXT,
  "content" TEXT NOT NULL,
  "likes_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS "timeline_likes" (
  "post_id" UUID REFERENCES "timeline_posts"("id") ON DELETE CASCADE,
  "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  PRIMARY KEY ("post_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "timeline_comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" UUID REFERENCES "timeline_posts"("id") ON DELETE CASCADE,
  "author_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "author_name" TEXT,
  "text" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE "friends" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "friend_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kudos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_chats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "timeline_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "timeline_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "timeline_comments" ENABLE ROW LEVEL SECURITY;

-- Friends: Anyone can read, users can insert/delete their own
CREATE POLICY "Public friends read" ON "friends" FOR SELECT USING (true);
CREATE POLICY "Users manage own friends" ON "friends" FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend Requests: Sender and Receiver can read/update
CREATE POLICY "Involved can read friend requests" ON "friend_requests" FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send requests" ON "friend_requests" FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update requests" ON "friend_requests" FOR UPDATE USING (auth.uid() = receiver_id);

-- Kudos: Public read, users can give kudos
CREATE POLICY "Public kudos read" ON "kudos" FOR SELECT USING (true);
CREATE POLICY "Users give kudos" ON "kudos" FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users remove kudos" ON "kudos" FOR DELETE USING (auth.uid() = sender_id);

-- Group Chats & Members: Members can read/write
CREATE POLICY "Members read groups" ON "group_chats" FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_chats.id AND user_id = auth.uid()) OR auth.uid() = created_by
);
CREATE POLICY "Users create groups" ON "group_chats" FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members read membership" ON "group_members" FOR SELECT USING (true);
CREATE POLICY "Users join groups" ON "group_members" FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS(SELECT 1 FROM group_chats WHERE id = group_id AND created_by = auth.uid()));

CREATE POLICY "Members read/write messages" ON "group_messages" FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Members insert messages" ON "group_messages" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);

-- Timeline: Public read, Author write
CREATE POLICY "Public timeline read" ON "timeline_posts" FOR SELECT USING (true);
CREATE POLICY "Authors create posts" ON "timeline_posts" FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors update posts" ON "timeline_posts" FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Public timeline likes read" ON "timeline_likes" FOR SELECT USING (true);
CREATE POLICY "Users manage own likes" ON "timeline_likes" FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public timeline comments read" ON "timeline_comments" FOR SELECT USING (true);
CREATE POLICY "Users manage own comments" ON "timeline_comments" FOR ALL USING (auth.uid() = author_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE "friend_requests";
ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
ALTER PUBLICATION supabase_realtime ADD TABLE "group_messages";
ALTER PUBLICATION supabase_realtime ADD TABLE "timeline_posts";
ALTER PUBLICATION supabase_realtime ADD TABLE "timeline_comments";

-- Likes RPCs
CREATE OR REPLACE FUNCTION increment_likes(p_id UUID) RETURNS VOID AS $$ BEGIN UPDATE timeline_posts SET likes_count = likes_count + 1 WHERE id = p_id; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION decrement_likes(p_id UUID) RETURNS VOID AS $$ BEGIN UPDATE timeline_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_id; END; $$ LANGUAGE plpgsql;
