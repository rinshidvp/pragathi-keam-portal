-- Add public read policy for event-images bucket (defensive; bucket is already public)
CREATE POLICY "Public can read event images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'event-images');