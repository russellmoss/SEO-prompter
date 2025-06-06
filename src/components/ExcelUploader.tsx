'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { ExcelParser } from '@/lib/excelParser';
import { ExcelRow } from '@/lib/types';

interface ExcelUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

export default function ExcelUploader({ onUpload }: ExcelUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setFileName(file.name);
    
    try {
      console.log('Starting file upload:', file.name);
      await onUpload(file);
      console.log('File uploaded successfully');
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileUpload(file);
    } else {
      setError('Please upload a valid Excel file (.xlsx or .xls).');
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="w-full max-w-md mx-auto p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Upload Excel File
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            .xlsx or .xls files only
          </span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          disabled={loading}
        />
      </div>
      {loading && (
        <div className="mt-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Processing {fileName}...</p>
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {fileName && !loading && !error && (
        <p className="mt-2 text-sm text-green-600">Successfully loaded {fileName}</p>
      )}
    </div>
  );
} 