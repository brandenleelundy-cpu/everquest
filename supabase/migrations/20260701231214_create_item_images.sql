/*
# Item images — storage bucket + metadata table

## Summary
Enables community-uploaded item screenshots and graphics. A public Supabase
Storage bucket holds the raw files; the item_images table stores metadata
(item name, storage path, optional caption, optional uploader name).

## Storage
- Bucket: item-images (public)
- Size limit: 5 MB per file
- Accepted MIME types: jpeg, png, gif, webp

## New Tables

### item_images
| Column        | Type        | Description                              |
|---------------|-------------|------------------------------------------|
| id            | uuid (PK)   | Auto-generated identifier                |
| item_name     | text        | Name of the item (matches items in wiki) |
| storage_path  | text        | Supabase Storage object path             |
| caption       | text        | Optional description (max 100 chars)     |
| uploader_name | text        | Optional in-game name (max 40 chars)     |
| created_at    | timestamptz | Upload timestamp                         |

## Security
- item_images: anon SELECT + INSERT (wiki is open community)
- storage.objects: anon SELECT + INSERT scoped to bucket 'item-images'
*/

-- ── Storage bucket ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "item_images_anon_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'item-images');

CREATE POLICY "item_images_anon_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'item-images');

-- ── Metadata table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item_images (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name      text NOT NULL CHECK (char_length(item_name) BETWEEN 1 AND 80),
  storage_path   text NOT NULL CHECK (char_length(storage_path) > 0),
  caption        text CHECK (char_length(caption) <= 100),
  uploader_name  text CHECK (char_length(uploader_name) <= 40),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS item_images_item_name_idx ON item_images (item_name);

ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_item_images" ON item_images
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_item_images" ON item_images
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(item_name) BETWEEN 1 AND 80
    AND char_length(storage_path) > 0
  );
