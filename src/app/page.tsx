'use client';

import { useState, useEffect } from 'react';
import { TemplateMapping, ExcelRow, SavedPrompt } from '@/lib/types';
import { ExcelParser } from '@/lib/excelParser';
import { TemplateManager } from '@/components/TemplateManager';
import ExcelUploader from '@/components/ExcelUploader';
import PromptTabs from '@/components/PromptTabs';
import { templateService } from '@/lib/templateService';
import { savedPromptService } from '@/lib/savedPromptService';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [templates, setTemplates] = useState<TemplateMapping[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateMapping | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'prompts'>('templates');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | undefined>();

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

  const handleExcelUpload = async (file: File) => {
    try {
      const data = await ExcelParser.parseFile(file);
      setExcelData(data);
      setActiveTab('prompts');
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setError('Failed to parse Excel file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Excel Prompt Generator</h1>
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

        <div className="mb-8">
          <ExcelUploader onUpload={handleExcelUpload} />
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
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
          >
            Prompts
          </button>
        </div>

        {activeTab === 'templates' ? (
          <TemplateManager
            templates={templates}
            onSelect={handleTemplateSelect}
            onSave={handleTemplateSave}
            onDelete={handleTemplateDelete}
          />
        ) : (
          <PromptTabs
            data={excelData}
            template={activeTemplate}
            initialSavedPrompt={editingPrompt}
          />
        )}
      </div>
    </main>
  );
}
