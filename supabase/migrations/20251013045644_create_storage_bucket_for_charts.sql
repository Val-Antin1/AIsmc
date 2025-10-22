/*
  # Create Storage Bucket for Chart Uploads

  1. Storage Setup
    - Create 'chart-uploads' bucket for storing trading chart images
    - Enable public access for uploaded charts
    - Set file size limit to 10MB
    - Allow JPG, JPEG, PNG file types

  2. Security Policies
    - Allow anyone to upload files (public access, no auth required)
    - Allow anyone to read files (public bucket)
    - Allow users to delete their own uploads

  3. Important Notes
    - This bucket is publicly accessible for demo purposes
    - In production, you may want to restrict uploads to authenticated users only
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chart-uploads',
  'chart-uploads',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png'];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can upload charts'
  ) THEN
    CREATE POLICY "Anyone can upload charts"
      ON storage.objects
      FOR INSERT
      TO anon
      WITH CHECK (bucket_id = 'chart-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can read charts'
  ) THEN
    CREATE POLICY "Anyone can read charts"
      ON storage.objects
      FOR SELECT
      TO anon
      USING (bucket_id = 'chart-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can update charts'
  ) THEN
    CREATE POLICY "Anyone can update charts"
      ON storage.objects
      FOR UPDATE
      TO anon
      USING (bucket_id = 'chart-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can delete charts'
  ) THEN
    CREATE POLICY "Anyone can delete charts"
      ON storage.objects
      FOR DELETE
      TO anon
      USING (bucket_id = 'chart-uploads');
  END IF;
END $$;
