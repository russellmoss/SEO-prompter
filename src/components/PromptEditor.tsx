'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { TemplateMapping, ExcelRow } from '@/lib/types';

interface Field {
  id: string;
  label: string;
  type: 'text' | 'array' | 'textarea';
  excelColumn?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

interface PromptEditorProps {
  template: TemplateMapping;
  data: ExcelRow;
  onSave: (template: TemplateMapping) => void;
}

export default function PromptEditor({ template, data, onSave }: PromptEditorProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Initialize field values from Excel data
    const initialValues: Record<string, string> = {};
    template.fields.forEach(field => {
      if (field.excelColumn && data[field.excelColumn]) {
        initialValues[field.id] = data[field.excelColumn];
      } else {
        initialValues[field.id] = '';
      }
    });
    setFieldValues(initialValues);
  }, [template.fields, data]);

  const generatePrompt = () => {
    let prompt = template.content;
    template.fields.forEach(field => {
      const value = fieldValues[field.id] || '';
      const placeholder = `[${field.id.toUpperCase()}]`;
      prompt = prompt.replaceAll(placeholder, value);
    });
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

  const renderField = (field: TemplateMapping['fields'][0]) => {
    const value = fieldValues[field.id] || '';
    const excelValue = field.excelColumn ? data[field.excelColumn] : '';

    if (field.type === 'textarea') {
      return (
        <textarea
          key={field.id}
          value={value}
          onChange={(e) => updateField(field.id, e.target.value)}
          placeholder={field.placeholder || "Enter your text here..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      );
    }

    if (field.type === 'array') {
      return (
        <input
          key={field.id}
          type="text"
          value={value}
          onChange={(e) => updateField(field.id, e.target.value)}
          placeholder={field.placeholder || "Enter comma-separated values"}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
    }

    // Default case for 'text' type
    return (
      <div key={field.id} className="space-y-1">
        <input
          type="text"
          value={value}
          onChange={(e) => updateField(field.id, e.target.value)}
          placeholder={field.placeholder || "Enter text here..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {field.excelColumn && excelValue && (
          <p className="text-xs text-gray-500">
            Excel value: {excelValue}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
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
              {field.excelColumn && (
                <span className="text-xs text-gray-500 ml-2">
                  (Excel: {field.excelColumn})
                </span>
              )}
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