'use client';

import { useState, useEffect } from 'react';
import { TemplateMapping, ExcelRow, SavedPrompt } from '@/lib/types';
import { ExcelParser } from '@/lib/excelParser';
import { TemplateManager } from '@/components/TemplateManager';
import FileManager from '@/components/FileManager';
import PromptTabs from '@/components/PromptTabs';
import { templateService } from '@/lib/templateService';
import { savedPromptService } from '@/lib/savedPromptService';
import { supabase } from '@/lib/supabase';
import { fileStorageService, StoredFile } from '@/lib/fileStorageService';
import Link from 'next/link';

export default function Home() {
  const [templates, setTemplates] = useState<TemplateMapping[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateMapping | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [activeTab, setActiveTab] = useState<'files' | 'templates' | 'prompts'>('files');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | undefined>();
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('templates').select('count');
        if (error) {
          console.error('Supabase connection error:', error);
          setError('Failed to connect to database');
        } else {
          console.log('Supabase connection successful:', data);
        }
      } catch (err) {
        console.error('Error testing connection:', err);
        setError('Failed to connect to database');
      }
    };

    testConnection();
    loadTemplates();
  }, []);

  // Load saved prompt if editing
  useEffect(() => {
    const loadSavedPrompt = async () => {
      const params = new URLSearchParams(window.location.search);
      const promptId = params.get('promptId');
      
      if (promptId) {
        try {
          const savedPrompt = await savedPromptService.getPromptById(promptId);
          setEditingPrompt(savedPrompt);
          
          // Find and set the template
          const template = templates.find(t => t.id === savedPrompt.templateId);
          if (template) {
            setActiveTemplate(template);
            setActiveTab('prompts');
          }
        } catch (err) {
          console.error('Error loading saved prompt:', err);
          setError('Failed to load saved prompt');
        }
      }
    };

    if (templates.length > 0) {
      loadSavedPrompt();
    }
  }, [templates]);

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
      setError('Failed to load templates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: TemplateMapping) => {
    setActiveTemplate(template);
    setActiveTab('prompts');
  };

  const handleTemplateSave = async (template: TemplateMapping) => {
    console.log('Page: Attempting to save template:', template);
    try {
      const savedTemplate = await templateService.saveTemplate(template);
      console.log('Page: Template saved successfully:', savedTemplate);
      setTemplates(prev => {
        const index = prev.findIndex(t => t.id === savedTemplate.id);
        if (index === -1) {
          return [...prev, savedTemplate];
        }
        const updated = [...prev];
        updated[index] = savedTemplate;
        return updated;
      });
      setActiveTemplate(savedTemplate);
    } catch (err) {
      console.error('Page: Error saving template:', err);
      setError('Failed to save template. Please try again.');
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    try {
      await templateService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (activeTemplate?.id === templateId) {
        setActiveTemplate(templates[0] || null);
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template. Please try again.');
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
      const data = await ExcelParser.parseFile(fileObj);
      setExcelData(data);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
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
          <div className="flex space-x-4">
            <Link
              href="/content-calendar"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Content Calendar Analysis
            </Link>
            <Link
              href="/saved-prompts"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View Saved Prompts
            </Link>
          </div>
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
              onSelect={handleTemplateSelect}
              onSave={handleTemplateSave}
              onDelete={handleTemplateDelete}
            />
          )}
          
          {activeTab === 'prompts' && selectedFile && excelData.length > 0 && (
            <PromptTabs
              data={excelData}
              template={activeTemplate}
              initialSavedPrompt={editingPrompt}
            />
          )}
        </div>
      </div>
    </main>
  );
}
