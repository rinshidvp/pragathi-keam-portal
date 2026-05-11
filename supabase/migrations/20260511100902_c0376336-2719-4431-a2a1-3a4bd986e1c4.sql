
-- Public buckets serve files via the public CDN URL without requiring an
-- RLS SELECT policy. Remove the broad SELECT policies that also allowed
-- listing all files in the bucket.
DROP POLICY IF EXISTS "Answer key files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
