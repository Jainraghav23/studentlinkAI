
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-covers', 'group-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Group covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-covers');

CREATE POLICY "Authenticated users can upload group covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own group covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own group covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
