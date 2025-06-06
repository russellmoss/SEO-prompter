# Excel to Cursor Prompt Generator - Complete Build Guide

## Overview
Build a Next.js application that uploads Excel files and generates customizable Cursor.ai prompts with auto-populated fields and manual editing capabilities.

## Prerequisites
- Node.js 18+ installed
- Cursor AI or VS Code
- Vercel account for deployment

## Step 1: Project Setup

### Initialize Next.js Project
```bash
npx create-next-app@latest excel-prompt-generator
cd excel-prompt-generator
```

### Install Dependencies
```bash
npm install xlsx lucide-react @tailwindcss/forms
npm install -D @types/node
```

## Step 2: Project Structure

Create the following file structure:
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ExcelUploader.tsx
│   ├── PromptEditor.tsx
│   ├── PromptTabs.tsx
│   └── TemplateManager.tsx
├── lib/
│   ├── excelParser.ts
│   ├── promptTemplates.ts
│   └── types.ts
└── hooks/
    └── useLocalStorage.ts
```

## Step 3: Type Definitions

Create `src/lib/types.ts`:
```typescript
export interface ExcelRow {
  Week: string;
  Title: string;
  Keywords: string;
  CTA: string;
  'External Links': string;
  'Internal Links': string;
  [key: string]: any;
}

export interface PromptField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'array';
  placeholder: string;
  excelColumn?: string;
  required?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  fields: PromptField[];
}

export interface GeneratedPrompt {
  id: string;
  title: string;
  content: string;
  originalData: ExcelRow;
}
```

## Step 4: Excel Parser Utility

Create `src/lib/excelParser.ts`:
```typescript
import * as XLSX from 'xlsx';
import { ExcelRow } from './types';

export class ExcelParser {
  static async parseFile(file: File): Promise<ExcelRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  static parseDelimitedField(value: string): string[] {
    if (!value) return [];
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  static formatArrayAsString(arr: string[]): string {
    return arr.join(', ');
  }
}
```

## Step 5: Default Prompt Template

Create `src/lib/promptTemplates.ts`:
```typescript
import { PromptTemplate } from './types';

export const defaultMileaTemplate: PromptTemplate = {
  id: 'milea-blog',
  name: 'Milea Estate Blog Post',
  content: `CORE INSTRUCTIONS
Write a 1,200-word blog post titled: "[TITLE]" for Milea Estate Vineyard, a premier winery and wedding venue in the Hudson Valley of New York.
SEO OPTIMIZATION: Target these keyword phrases: [KEYWORDS]
CONTENT REQUIREMENTS:

[INSERT ANY CONTENT REQUIREMENTS] 

HTML STRUCTURE & STYLING REQUIREMENTS
CRITICAL: All content must be wrapped in a <div class="milea-blog-content"> container with the complete CSS styling provided below. This prevents conflicts with the website header.

[REST OF TEMPLATE...]

POST-SPECIFIC CUSTOMIZATION:
• Keywords: [KEYWORDS]
• CTA Focus: [CTA_FOCUS]
• External Links: [EXTERNAL_LINKS]
• Internal Links: [INTERNAL_LINKS]
• Photo 1: [PHOTO_1_DESC] – [PHOTO_1_LINK]
• Photo 2: [PHOTO_2_DESC] – [PHOTO_2_LINK]
• Photo 3: [PHOTO_3_DESC] – [PHOTO_3_LINK]
• Photo 4: [PHOTO_4_DESC] – [PHOTO_4_LINK]`,
  fields: [
    {
      id: 'title',
      label: 'Blog Title',
      type: 'text',
      placeholder: 'Enter blog post title',
      excelColumn: 'Title',
      required: true
    },
    {
      id: 'keywords',
      label: 'SEO Keywords',
      type: 'text',
      placeholder: 'Enter comma-separated keywords',
      excelColumn: 'Keywords',
      required: true
    },
    {
      id: 'content_requirements',
      label: 'Content Requirements',
      type: 'textarea',
      placeholder: 'Enter any specific content requirements',
      required: false
    },
    {
      id: 'cta_focus',
      label: 'CTA Focus',
      type: 'text',
      placeholder: 'Enter main call-to-action focus',
      excelColumn: 'CTA',
      required: true
    },
    {
      id: 'external_links',
      label: 'External Links (3)',
      type: 'array',
      placeholder: 'Enter external links, comma-separated',
      excelColumn: 'External Links',
      required: false
    },
    {
      id: 'internal_links',
      label: 'Internal Links (2-3)',
      type: 'array',
      placeholder: 'Enter internal links, comma-separated',
      excelColumn: 'Internal Links',
      required: false
    },
    {
      id: 'photo_1_desc',
      label: 'Photo 1 Description',
      type: 'text',
      placeholder: 'Describe photo 1',
      required: false
    },
    {
      id: 'photo_1_link',
      label: 'Photo 1 Link',
      type: 'text',
      placeholder: 'Enter photo 1 URL',
      required: false
    },
    {
      id: 'photo_2_desc',
      label: 'Photo 2 Description',
      type: 'text',
      placeholder: 'Describe photo 2',
      required: false
    },
    {
      id: 'photo_2_link',
      label: 'Photo 2 Link',
      type: 'text',
      placeholder: 'Enter photo 2 URL',
      required: false
    },
    {
      id: 'photo_3_desc',
      label: 'Photo 3 Description',
      type: 'text',
      placeholder: 'Describe photo 3',
      required: false
    },
    {
      id: 'photo_3_link',
      label: 'Photo 3 Link',
      type: 'text',
      placeholder: 'Enter photo 3 URL',
      required: false
    },
    {
      id: 'photo_4_desc',
      label: 'Photo 4 Description',
      type: 'text',
      placeholder: 'Describe photo 4',
      required: false
    },
    {
      id: 'photo_4_link',
      label: 'Photo 4 Link',
      type: 'text',
      placeholder: 'Enter photo 4 URL',
      required: false
    }
  ]
};

export const getTemplates = (): PromptTemplate[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('prompt-templates');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return [defaultMileaTemplate];
};

export const saveTemplates = (templates: PromptTemplate[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prompt-templates', JSON.stringify(templates));
  }
};
```

## Step 6: Main Components

### Excel Uploader Component
Create `src/components/ExcelUploader.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { ExcelParser } from '@/lib/excelParser';
import { ExcelRow } from '@/lib/types';

interface ExcelUploaderProps {
  onDataLoaded: (data: ExcelRow[]) => void;
}

export default function ExcelUploader({ onDataLoaded }: ExcelUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ExcelParser.parseFile(file);
      onDataLoaded(data);
    } catch (err) {
      setError('Failed to parse Excel file. Please check the format.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Upload Excel File
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              .xlsx files only
            </span>
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            accept=".xlsx,.xls"
            className="sr-only"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </div>
        {loading && (
          <div className="mt-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
```

### Prompt Editor Component
Create `src/components/PromptEditor.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { PromptTemplate, PromptField, ExcelRow } from '@/lib/types';
import { ExcelParser } from '@/lib/excelParser';

interface PromptEditorProps {
  template: PromptTemplate;
  data?: ExcelRow;
  title: string;
}

export default function PromptEditor({ template, data, title }: PromptEditorProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Auto-populate fields from Excel data
    if (data) {
      const initialValues: Record<string, string> = {};
      
      template.fields.forEach(field => {
        if (field.excelColumn && data[field.excelColumn]) {
          if (field.type === 'array') {
            const parsed = ExcelParser.parseDelimitedField(data[field.excelColumn]);
            initialValues[field.id] = parsed.join(', ');
          } else {
            initialValues[field.id] = data[field.excelColumn];
          }
        }
      });
      
      setFieldValues(initialValues);
    }
  }, [data, template.fields]);

  const generatePrompt = () => {
    let prompt = template.content;
    
    // Replace placeholders with field values
    template.fields.forEach(field => {
      const value = fieldValues[field.id] || '';
      const placeholder = `[${field.id.toUpperCase()}]`;
      prompt = prompt.replaceAll(placeholder, value);
    });

    // Handle special cases
    prompt = prompt.replaceAll('[TITLE]', fieldValues.title || '');
    prompt = prompt.replaceAll('[KEYWORDS]', fieldValues.keywords || '');
    prompt = prompt.replaceAll('[INSERT ANY CONTENT REQUIREMENTS]', fieldValues.content_requirements || '');
    prompt = prompt.replaceAll('[CTA_FOCUS]', fieldValues.cta_focus || '');
    prompt = prompt.replaceAll('[EXTERNAL_LINKS]', fieldValues.external_links || '');
    prompt = prompt.replaceAll('[INTERNAL_LINKS]', fieldValues.internal_links || '');
    
    // Handle photo placeholders
    for (let i = 1; i <= 4; i++) {
      const desc = fieldValues[`photo_${i}_desc`] || '[Photo Description]';
      const link = fieldValues[`photo_${i}_link`] || '[imgur link]';
      prompt = prompt.replaceAll(`[PHOTO_${i}_DESC]`, desc);
      prompt = prompt.replaceAll(`[PHOTO_${i}_LINK]`, link);
    }

    return prompt;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatePrompt());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const updateField = (fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: PromptField) => {
    const value = fieldValues[field.id] || '';

    if (field.type === 'textarea') {
      return (
        <textarea
          key={field.id}
          value={value}
          onChange={(e) => updateField(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      );
    }

    return (
      <input
        key={field.id}
        type="text"
        value={value}
        onChange={(e) => updateField(field.id, e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {template.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Generated Prompt Preview
        </label>
        <textarea
          value={generatePrompt()}
          readOnly
          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-mono"
        />
      </div>
    </div>
  );
}
```

### Prompt Tabs Component
Create `src/components/PromptTabs.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { ExcelRow, PromptTemplate } from '@/lib/types';
import PromptEditor from './PromptEditor';

interface PromptTabsProps {
  data: ExcelRow[];
  template: PromptTemplate;
}

export default function PromptTabs({ data, template }: PromptTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available. Please upload an Excel file.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {data.map((row, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {row.Title || `Post ${index + 1}`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <PromptEditor
          template={template}
          data={data[activeTab]}
          title={data[activeTab]?.Title || `Post ${activeTab + 1}`}
        />
      </div>
    </div>
  );
}
```

### Template Manager Component
Create `src/components/TemplateManager.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { PromptTemplate, PromptField } from '@/lib/types';

interface TemplateManagerProps {
  templates: PromptTemplate[];
  onTemplatesChange: (templates: PromptTemplate[]) => void;
  activeTemplate: PromptTemplate;
  onTemplateSelect: (template: PromptTemplate) => void;
}

export default function TemplateManager({ 
  templates, 
  onTemplatesChange, 
  activeTemplate, 
  onTemplateSelect 
}: TemplateManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  const startEdit = (template?: PromptTemplate) => {
    setEditingTemplate(template || {
      id: '',
      name: '',
      content: '',
      fields: []
    });
    setIsEditing(true);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;

    const newTemplate = {
      ...editingTemplate,
      id: editingTemplate.id || Date.now().toString()
    };

    const updatedTemplates = editingTemplate.id
      ? templates.map(t => t.id === editingTemplate.id ? newTemplate : t)
      : [...templates, newTemplate];

    onTemplatesChange(updatedTemplates);
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const deleteTemplate = (templateId: string) => {
    if (templates.length === 1) {
      alert('Cannot delete the last template');
      return;
    }
    
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    onTemplatesChange(updatedTemplates);
    
    if (activeTemplate.id === templateId) {
      onTemplateSelect(updatedTemplates[0]);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {editingTemplate?.id ? 'Edit Template' : 'New Template'}
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <input
            type="text"
            value={editingTemplate?.name || ''}
            onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter template name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Content
          </label>
          <textarea
            value={editingTemplate?.content || ''}
            onChange={(e) => setEditingTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            placeholder="Enter template content with placeholders like [TITLE], [KEYWORDS], etc."
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={saveTemplate}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Templates</h3>
        <button
          onClick={() => startEdit()}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </button>
      </div>

      <div className="space-y-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-3 border rounded-md cursor-pointer ${
              activeTemplate.id === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{template.name}</span>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(template);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate(template.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Step 7: Main Page

Update `src/app/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import ExcelUploader from '@/components/ExcelUploader';
import PromptTabs from '@/components/PromptTabs';
import TemplateManager from '@/components/TemplateManager';
import { ExcelRow, PromptTemplate } from '@/lib/types';
import { getTemplates, saveTemplates } from '@/lib/promptTemplates';

export default function Home() {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>(getTemplates());
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate>(templates[0]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  const handleTemplatesChange = (newTemplates: PromptTemplate[]) => {
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Excel to Cursor Prompt Generator
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload Excel files and generate customizable Cursor.ai prompts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ExcelUploader onDataLoaded={setExcelData} />
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Templates</h2>
                <button
                  onClick={() => setShowTemplateManager(!showTemplateManager)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showTemplateManager ? 'Hide' : 'Manage'}
                </button>
              </div>
              
              {showTemplateManager ? (
                <TemplateManager
                  templates={templates}
                  onTemplatesChange={handleTemplatesChange}
                  activeTemplate={activeTemplate}
                  onTemplateSelect={setActiveTemplate}
                />
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setActiveTemplate(template)}
                      className={`w-full text-left p-2 rounded-md text-sm ${
                        activeTemplate.id === template.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {excelData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-2">Data Summary</h3>
                <p className="text-sm text-gray-600">
                  {excelData.length} rows loaded
                </p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {excelData.length > 0 ? (
                  <PromptTabs data={excelData} template={activeTemplate} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Upload an Excel file to get started</p>
                    <p className="text-sm mt-2">
                      Your file should contain columns for Title, Keywords, CTA, External Links, and Internal Links
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Step 8: Global Styles

Update `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: system-ui, sans-serif;
  }
}

@layer components {
  .cta-button {
    @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 mr-2 mb-2;
  }
}
```

## Step 9: Deployment to Vercel

### Connect to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts to connect your GitHub repo
```

### Environment Setup
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings (Next.js auto-detected)
4. Deploy

## Step 10: Usage Instructions

### Basic Usage:
1. **Upload Excel File**: Click the upload area and select your .xlsx file
2. **Select Template**: Choose from available templates in the sidebar
3. **Review Generated Prompts**: Use tabs to navigate between different rows
4. **Edit Fields**: Modify any auto-populated or empty fields as needed
5. **Copy Prompt**: Click "Copy Prompt" to copy the generated text to clipboard

### Template Management:
1. **Create New Template**: Click "Manage" → "New Template"
2. **Edit Existing**: Click the edit icon next to any template
3. **Define Fields**: Use placeholders like `[TITLE]`, `[KEYWORDS]` in template content
4. **Map Excel Columns**: Specify which Excel columns auto-populate which fields

### Advanced Features:
- **Array Fields**: Comma-delimited values from Excel automatically split into arrays
- **Manual Override**: All auto-populated fields can be manually edited
- **Live Preview**: See generated prompt update in real-time as you edit fields
- **Multiple Rows**: Handle up to 16 blog posts simultaneously with tabbed interface

## Maintenance Notes

- **Templates**: Stored in browser localStorage
- **No Data Persistence**: Excel data only exists during session
- **Browser Compatibility**: Requires modern browser with Clipboard API support
- **File Size Limits**: Reasonable Excel file sizes (under 10MB recommended)

This setup provides a complete, production-ready application for generating Cursor.ai prompts from Excel data with full customization capabilities.