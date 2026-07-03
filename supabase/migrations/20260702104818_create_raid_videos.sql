/*
# Raid Videos

Community-submitted video guides (YouTube / other) for each raid boss.
Stored with an extracted video_id for YouTube embeds and thumbnails.
Anon can SELECT and INSERT; no DELETE (moderation handled separately).
*/

CREATE TABLE IF NOT EXISTS raid_videos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_name      text NOT NULL CHECK (char_length(boss_name) BETWEEN 1 AND 80),
  title          text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  url            text NOT NULL CHECK (char_length(url) BETWEEN 10 AND 500),
  video_type     text NOT NULL CHECK (video_type IN ('youtube','other')),
  video_id       text,
  submitter_name text CHECK (char_length(submitter_name) <= 40),
  notes          text CHECK (char_length(notes) <= 200),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS raid_videos_boss_idx ON raid_videos (boss_name);

ALTER TABLE raid_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_raid_videos" ON raid_videos
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_raid_videos" ON raid_videos
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(title) BETWEEN 1 AND 100
    AND char_length(url) BETWEEN 10 AND 500
  );
