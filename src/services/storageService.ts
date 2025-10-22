import { supabase } from '../lib/supabase';

export class StorageService {
  private static BUCKET_NAME = 'chart-uploads';

  static async uploadChart(file: Blob, filename: string): Promise<string> {
    const timestamp = Date.now();
    const path = `${timestamp}-${filename}`;

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(path, file, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload chart: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  static async ensureBucketExists(): Promise<void> {
    return Promise.resolve();
  }
}
