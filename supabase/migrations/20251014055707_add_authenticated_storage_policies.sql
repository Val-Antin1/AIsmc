/*
  # Add Authenticated User Storage Policies

  1. Storage Policies Update
    - Add policies for authenticated users to upload, read, update, and delete charts
    - Keep existing anon policies for backward compatibility
    - Authenticated users get full access to chart-uploads bucket

  2. Security Notes
    - Authenticated users can manage their own uploads
    - Public access maintained through anon policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload charts'
  ) THEN
    CREATE POLICY "Authenticated users can upload charts"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'chart-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can read charts'
  ) THEN
    CREATE POLICY "Authenticated users can read charts"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'chart-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update charts'
  ) THEN
    CREATE POLICY "Authenticated users can update charts"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'chart-uploads');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete charts'
  ) THEN
    CREATE POLICY "Authenticated users can delete charts"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'chart-uploads');
  END IF;
END $$;
