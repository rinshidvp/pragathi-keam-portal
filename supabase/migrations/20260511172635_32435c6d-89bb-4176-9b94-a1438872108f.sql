
-- Fix: permission denied for function has_role
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- Storage policies for event-images bucket
DROP POLICY IF EXISTS "Public can read event-images" ON storage.objects;
CREATE POLICY "Public can read event-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Admins can upload event-images" ON storage.objects;
CREATE POLICY "Admins can upload event-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update event-images" ON storage.objects;
CREATE POLICY "Admins can update event-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete event-images" ON storage.objects;
CREATE POLICY "Admins can delete event-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
