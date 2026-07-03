/*
# Create comments table

## Summary
Adds a community comments system to the Frostreaver TLP Wiki. Comments are
scoped to a content type + content id pair so the same table can serve
multiple sections (raid bosses, zones, items, etc.).

## New Tables

### comments
| Column        | Type        | Description                                        |
|---------------|-------------|----------------------------------------------------|
| id            | uuid (PK)   | Auto-generated identifier                          |
| content_type  | text        | Section the comment belongs to: 'raid', 'zone',    |
|               |             | 'item', 'quest', or 'general'                      |
| content_id    | text        | Slug or name of the specific piece of content      |
| author_name   | text        | Optional display name (blank → "Anonymous")        |
| body          | text        | Comment text (10–2000 chars)                       |
| created_at    | timestamptz | Submission timestamp                               |

## Security
- RLS enabled. Community wiki — no auth required.
- anon + authenticated: SELECT and INSERT only.
- INSERT requires non-trivial field validation (not "always true").
- No UPDATE or DELETE for anon — service role manages moderation.
*/

CREATE TABLE IF NOT EXISTS comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL
               CHECK (content_type IN ('raid','zone','item','quest','general')),
  content_id   text NOT NULL CHECK (char_length(content_id) BETWEEN 1 AND 120),
  author_name  text CHECK (char_length(author_name) <= 40),
  body         text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 2000),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_content_idx
  ON comments (content_type, content_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx
  ON comments (created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_comments" ON comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_comments" ON comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    content_type IN ('raid','zone','item','quest','general')
    AND char_length(content_id) BETWEEN 1 AND 120
    AND char_length(body) BETWEEN 10 AND 2000
  );
