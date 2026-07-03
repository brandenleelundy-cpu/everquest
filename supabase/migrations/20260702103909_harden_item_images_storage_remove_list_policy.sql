-- Drop the broad SELECT policy that allows listing all files in the item-images
-- bucket. Public buckets serve objects by URL without any RLS SELECT policy;
-- this policy only enabled directory-style listing, which is not used by the
-- application and exposes more data than intended.
DROP POLICY IF EXISTS "item_images_anon_select" ON storage.objects;
