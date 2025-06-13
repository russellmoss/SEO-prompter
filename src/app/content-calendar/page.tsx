'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Plus, ChevronLeft } from 'lucide-react';
import { ContentCalendarTemplate, ContentCalendarRow } from '@/lib/types';
import { ExcelParser } from '@/lib/excelParser';
import { contentCalendarService } from '@/lib/contentCalendarService';
import { fileStorageService, StoredFile } from '@/lib/fileStorageService';
import FileManager from '@/components/FileManager';
import ContentCalendarTemplateEditor from '@/components/ContentCalendarTemplateEditor';
import ContentCalendarAnalysis from '@/components/ContentCalendarAnalysis';

export default function ContentCalendarPage() {
  const [templates, setTemplates] = useState<ContentCalendarTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentCalendarTemplate | null>(null);
  const [calendarData, setCalendarData] = useState<ContentCalendarRow[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentCalendarTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<'files' | 'analyze'>('files');
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const loadedTemplates = await contentCalendarService.getTemplates();
      setTemplates(loadedTemplates);
      
      // Create default template if none exist
      if (loadedTemplates.length === 0) {
        const defaultTemplate = createDefaultTemplate();
        await contentCalendarService.saveTemplate(defaultTemplate);
        setTemplates([defaultTemplate]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTemplate = (): ContentCalendarTemplate => ({
    name: 'Content Analysis Template',
    description: 'Analyzes blog posts for external links, internal links, and content requirements',
    prompt: `You are analyzing a blog post for Milea Estate Vineyard. 

Blog Title: {{title}}
Keywords: {{keywords}}
Pillar: {{pillar}}

Please provide suggestions for:
1. External Links: 3 high-authority external links relevant to the topic
2. Internal Links: 2-3 internal links to other Milea Estate pages
3. Photo Descriptions: 5 photos with descriptive names
4. Content Requirements: Specific requirements to avoid semantic similarity with other posts

Consider the pillar category and ensure the content is unique compared to other posts in the same category.`,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Blog Title',
        type: 'text',
        excelColumn: 'B',
        required: true,
        isManualEntry: false,
        placeholder: '',
        description: 'The title of the blog post'
      },
      {
        id: 'keywords',
        name: 'keywords',
        label: 'Keywords',
        type: 'text',
        excelColumn: 'C',
        required: true,
        isManualEntry: false,
        placeholder: '',
        description: 'Target keywords for the post'
      },
      {
        id: 'pillar',
        name: 'pillar',
        label: 'Pillar',
        type: 'text',
        excelColumn: 'D',
        required: true,
        isManualEntry: false,
        placeholder: '',
        description: 'Content pillar category'
      }
    ],
    outputFields: [
      {
        id: 'external_links',
        name: 'external_links',
        label: 'External Links',
        type: 'array',
        description: '3 high-authority external links'
      },
      {
        id: 'internal_links',
        name: 'internal_links',
        label: 'Internal Links',
        type: 'array',
        description: '2-3 internal Milea Estate links'
      },
      {
        id: 'photo_descriptions',
        name: 'photo_descriptions',
        label: 'Photo Descriptions',
        type: 'array',
        description: '5 descriptive photo names'
      },
      {
        id: 'content_requirements',
        name: 'content_requirements',
        label: 'Content Requirements',
        type: 'textarea',
        description: 'Specific requirements for unique content'
      }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

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
      setCalendarData(data);
      setActiveStep('analyze');
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSave = async (template: ContentCalendarTemplate) => {
    try {
      const savedTemplate = await contentCalendarService.saveTemplate(template);
      await loadTemplates();
      setIsEditingTemplate(false);
      setEditingTemplate(null);
      setSelectedTemplate(savedTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await contentCalendarService.deleteTemplate(templateId);
      await loadTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const startEditTemplate = (template?: ContentCalendarTemplate) => {
    if (template) {
      setEditingTemplate(template);
    } else {
      setEditingTemplate({
        name: '',
        description: '',
        prompt: '',
        fields: [],
        outputFields: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setIsEditingTemplate(true);
  };

  if (loading && activeStep === 'files') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isEditingTemplate && editingTemplate) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">
            {editingTemplate.id ? 'Edit' : 'Create'} Content Calendar Template
          </h1>
          <div className="bg-white rounded-lg shadow p-6">
            <ContentCalendarTemplateEditor
              template={editingTemplate}
              onSave={handleTemplateSave}
              onCancel={() => {
                setIsEditingTemplate(false);
                setEditingTemplate(null);
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Content Calendar Analysis</h1>
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Content Creation
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${activeStep === 'files' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              activeStep === 'files' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Calendar</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
          <div className={`flex items-center ${activeStep === 'analyze' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              activeStep === 'analyze' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Analyze Content</span>
          </div>
        </div>

        {activeStep === 'files' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <FileManager
              onFileSelect={handleFileSelect}
              selectedFileId={selectedFile?.id}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File Indicator */}
            {selectedFile && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                <span className="text-blue-700">
                  Using: {selectedFile.original_filename}
                </span>
                <button
                  onClick={() => setActiveStep('files')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Change file
                </button>
              </div>
            )}

            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Select Template</h2>
                <button
                  onClick={() => startEditTemplate()}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <h3 className="font-medium mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditTemplate(template);
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateDelete(template.id!);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Component */}
            {selectedTemplate && calendarData.length > 0 && (
              <ContentCalendarAnalysis
                template={selectedTemplate}
                data={calendarData}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
} 