# Persistent Excel File Storage Implementation Guide

## Overview
This guide will help you implement persistent Excel file storage in your SEO Prompter application deployed on Vercel. We'll use Vercel Blob Storage for file persistence and Supabase for file metadata management.

## Architecture Overview
- **Vercel Blob Storage**: Store actual Excel files
- **Supabase**: Store file metadata and user associations
- **Frontend**: File manager UI with upload/delete/select capabilities

---

## Step 1: Set Up Vercel Blob Storage

### Cursor.ai Prompt:
```
Install @vercel/blob package and set up the necessary environment variables for Vercel Blob Storage integration
```

### Code Implementation:
```bash
npm install @vercel/blob
```

### Environment Variables:
Add to `.env.local`:
```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Testing Checkpoint:
- Verify package installed correctly with `npm list @vercel/blob`
- Ensure environment variable is set

---

## Step 2: Create Supabase Tables for File Metadata

### Cursor.ai Prompt:
```
Create a SQL migration for Supabase to add an excel_files table that stores file metadata including filename, blob_url, file_size, uploaded_at, and last_used_at
```

### Code Implementation:
Create `supabase/migrations/create_excel_files_table.sql`:
```sql
-- Create excel_files table
CREATE TABLE IF NOT EXISTS public.excel_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT DEFAULT 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_excel_files_uploaded_at ON public.excel_files(uploaded_at DESC);
CREATE INDEX idx_excel_files_last_used_at ON public.excel_files(last_used_at DESC);

-- Enable RLS
ALTER TABLE public.excel_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth setup)
CREATE POLICY "Anyone can read excel files" ON public.excel_files
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert excel files" ON public.excel_files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update excel files" ON public.excel_files
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete excel files" ON public.excel_files
  FOR DELETE USING (true);
```

### Testing Checkpoint:
- Run migration in Supabase dashboard
- Verify table created successfully

---

## Step 3: Create File Storage Service

### Cursor.ai Prompt:
```
Create a fileStorageService in src/lib/fileStorageService.ts that handles uploading files to Vercel Blob, saving metadata to Supabase, retrieving files, and deleting files
```

### Code Implementation:
```typescript
// src/lib/fileStorageService.ts
import { put, del, list } from '@vercel/blob';
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
      // Upload to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
      });

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
```

### Testing Checkpoint:
- Import service in a test component
- Verify TypeScript compilation succeeds

---

## Step 4: Create File Manager Component

### Cursor.ai Prompt:
```
Create a FileManager component in src/components/FileManager.tsx that displays uploaded Excel files in a grid, allows file selection, shows file details, supports file deletion with confirmation, and handles file upload
```

### Code Implementation:
```typescript
// src/components/FileManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Upload, Trash2, Clock, HardDrive, CheckCircle } from 'lucide-react';
import { fileStorageService, StoredFile } from '@/lib/fileStorageService';
import { formatDistanceToNow } from 'date-fns';

interface FileManagerProps {
  onFileSelect: (file: StoredFile) => void;
  selectedFileId?: string;
}

export default function FileManager({ onFileSelect, selectedFileId }: FileManagerProps) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const loadedFiles = await fileStorageService.listFiles();
      setFiles(loadedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const storedFile = await fileStorageService.uploadFile(file);
      setFiles(prev => [storedFile, ...prev]);
      onFileSelect(storedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fileStorageService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Excel Files</h3>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Upload className="h-4 w-4" />
            <span>{uploading ? 'Uploading...' : 'Upload New File'}</span>
          </div>
        </label>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
              selectedFileId === file.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onFileSelect(file)}
          >
            {/* Selected Indicator */}
            {selectedFileId === file.id && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            )}

            {/* File Icon */}
            <FileSpreadsheet className="h-8 w-8 text-gray-400 mb-2" />

            {/* File Name */}
            <h4 className="font-medium text-sm truncate mb-2">
              {file.original_filename}
            </h4>

            {/* File Details */}
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <HardDrive className="h-3 w-3" />
                <span>{formatFileSize(file.file_size)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Uploaded {formatDistanceToNow(new Date(file.uploaded_at))} ago</span>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm(file.id);
              }}
              className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Delete Confirmation */}
            {deleteConfirm === file.id && (
              <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm mb-3">Delete this file?</p>
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(null);
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No Excel files uploaded yet</p>
          <p className="text-sm mt-1">Upload your first file to get started</p>
        </div>
      )}
    </div>
  );
}
```

### Testing Checkpoint:
- Create component renders without errors
- UI displays correctly

---

## Step 5: Update Main Page to Integrate File Manager

### Cursor.ai Prompt:
```
Update the main page.tsx to integrate the FileManager component, allowing users to either select an existing file or upload a new one, and modify the Excel upload flow to use the persistent storage
```

### Code Implementation:
```typescript
// Update src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { TemplateMapping, EnhancedExcelRow, SavedPrompt } from '@/lib/types';
import { EnhancedExcelParser } from '@/lib/enhancedExcelParser';
import { fileStorageService, StoredFile } from '@/lib/fileStorageService';
import { TemplateManager } from '@/components/TemplateManager';
import FileManager from '@/components/FileManager';
import EnhancedPromptTabs from '@/components/EnhancedPromptTabs';
import { templateService } from '@/lib/templateService';
import Link from 'next/link';

export default function Home() {
  const [templates, setTemplates] = useState<TemplateMapping[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateMapping | null>(null);
  const [excelData, setExcelData] = useState<EnhancedExcelRow[]>([]);
  const [fullAnalysis, setFullAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'templates' | 'prompts'>('files');
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const loadedTemplates = await templateService.getTemplates();
      setTemplates(loadedTemplates);
      if (loadedTemplates.length > 0) {
        setActiveTemplate(loadedTemplates[0]);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: StoredFile) => {
    try {
      setLoading(true);
      setSelectedFile(file);
      
      // Fetch file content from blob URL
      const arrayBuffer = await fileStorageService.getFileContent(file.blob_url);
      const blob = new Blob([arrayBuffer]);
      const fileObj = new File([blob], file.original_filename, {
        type: file.mime_type
      });
      
      // Parse the file
      const result = await EnhancedExcelParser.parseFileWithAnalysis(fileObj);
      setExcelData(result.data);
      setFullAnalysis(result.fullAnalysis);
      setActiveTab('templates');
    } catch (error) {
      console.error('Error loading file:', error);
      setError('Failed to load Excel file');
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeTab === 'files') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Enhanced SEO Prompt Generator</h1>
            <p className="text-gray-600">With persistent file storage</p>
          </div>
          <Link
            href="/saved-prompts"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Saved Prompts
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'files'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Excel Files
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            disabled={!selectedFile}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'prompts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            disabled={!selectedFile || !excelData.length}
          >
            Generate Prompts
          </button>
        </div>

        {/* Selected File Indicator */}
        {selectedFile && activeTab !== 'files' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="text-blue-700">
              Using: {selectedFile.original_filename}
            </span>
            <button
              onClick={() => setActiveTab('files')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Change file
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'files' && (
            <FileManager
              onFileSelect={handleFileSelect}
              selectedFileId={selectedFile?.id}
            />
          )}
          
          {activeTab === 'templates' && selectedFile && (
            <TemplateManager
              templates={templates}
              onSelect={(template) => {
                setActiveTemplate(template);
                setActiveTab('prompts');
              }}
              onSave={handleTemplateSave}
              onDelete={handleTemplateDelete}
            />
          )}
          
          {activeTab === 'prompts' && selectedFile && excelData.length > 0 && (
            <EnhancedPromptTabs
              data={excelData}
              template={activeTemplate}
              fullAnalysis={fullAnalysis}
            />
          )}
        </div>
      </div>
    </main>
  );
}
```

### Testing Checkpoint:
- Upload a file and verify it appears in the file manager
- Select a file and verify data loads correctly
- Switch between files and verify data updates

---

## Step 6: Add API Route for Vercel Blob (Required for Production)

### Cursor.ai Prompt:
```
Create an API route in src/app/api/upload/route.ts to handle file uploads server-side for Vercel Blob Storage
```

### Code Implementation:
```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### Update File Storage Service:
```typescript
// Update uploadFile method in fileStorageService.ts
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
```

---

## Step 7: Environment Configuration for Vercel

### Cursor.ai Prompt:
```
Create a vercel.json configuration file to ensure proper environment variable handling and blob storage configuration
```

### Code Implementation:
```json
// vercel.json
{
  "functions": {
    "src/app/api/upload/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables in Vercel Dashboard:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add:
   - `BLOB_READ_WRITE_TOKEN` (get from Vercel Blob dashboard)
   - Your existing Supabase variables

---

## Step 8: Final Testing Checklist

### Testing Steps:
1. **Local Development Testing**:
   ```bash
   npm run dev
   ```
   - Upload an Excel file
   - Verify it appears in file manager
   - Select the file and generate prompts
   - Upload another file
   - Switch between files
   - Delete a file

2. **Production Deployment Testing**:
   ```bash
   vercel --prod
   ```
   - Repeat all local tests in production
   - Verify files persist after page refresh
   - Test with multiple browser sessions

3. **Edge Cases**:
   - Upload large files (5-10MB)
   - Upload invalid file types
   - Test concurrent uploads
   - Test file deletion while in use

---

## Troubleshooting Guide

### Common Issues:

1. **"Failed to upload file" error**:
   - Check BLOB_READ_WRITE_TOKEN is set correctly
   - Verify API route is deployed
   - Check Vercel Blob storage limits

2. **Files not persisting**:
   - Ensure Supabase connection is working
   - Check RLS policies on excel_files table
   - Verify blob URLs are accessible

3. **File content not loading**:
   - Check CORS settings on Vercel Blob
   - Verify blob URLs are public
   - Test direct blob URL access

### Monitoring:
- Check Vercel Functions logs for API errors
- Monitor Supabase logs for database errors
- Use browser DevTools for network issues

---

## Summary

You now have a fully functional persistent file storage system that:
- ✅ Stores Excel files permanently in Vercel Blob Storage
- ✅ Manages file metadata in Supabase
- ✅ Provides a user-friendly file manager interface
- ✅ Supports multiple files with easy switching
- ✅ Allows file deletion and replacement
- ✅ Works seamlessly with Vercel deployment
- ✅ Maintains file persistence across sessions

The system is production-ready and scales with your Vercel plan limits for blob storage.