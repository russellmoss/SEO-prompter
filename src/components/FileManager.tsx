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