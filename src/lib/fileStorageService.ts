import { del } from '@vercel/blob';
import { supabase } from './supabase';

export interface StoredFile {
  id: string;
  filename: string;
  original_filename: string;
  blob_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  last_used_at: string;
  metadata: any;
}

class FileStorageService {
  async uploadFile(file: File): Promise<StoredFile> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload via API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const blob = await response.json();
      
      // Save metadata to Supabase
      const { data, error } = await supabase
        .from('excel_files')
        .insert({
          filename: blob.pathname,
          original_filename: file.name,
          blob_url: blob.url,
          file_size: file.size,
          mime_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async listFiles(): Promise<StoredFile[]> {
    try {
      const { data, error } = await supabase
        .from('excel_files')
        .select('*')
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  async getFile(id: string): Promise<StoredFile | null> {
    try {
      const { data, error } = await supabase
        .from('excel_files')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Update last_used_at
      if (data) {
        await supabase
          .from('excel_files')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', id);
      }

      return data;
    } catch (error) {
      console.error('Error getting file:', error);
      return null;
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      // Get file info first
      const file = await this.getFile(id);
      if (!file) return false;

      // Delete from Vercel Blob
      await del(file.blob_url);

      // Delete from Supabase
      const { error } = await supabase
        .from('excel_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileContent(blob_url: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(blob_url);
      if (!response.ok) throw new Error('Failed to fetch file');
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw new Error('Failed to fetch file content');
    }
  }
}

export const fileStorageService = new FileStorageService(); 