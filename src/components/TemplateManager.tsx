'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { TemplateMapping } from '@/lib/types';
import TemplateEditor from './TemplateEditor';

interface TemplateManagerProps {
  templates: TemplateMapping[];
  onSelect: (template: TemplateMapping) => void;
  onSave: (template: TemplateMapping) => void;
  onDelete: (templateId: string) => void;
}

export function TemplateManager({ 
  templates, 
  onSelect,
  onSave, 
  onDelete 
}: TemplateManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateMapping | null>(null);

  const startEdit = (template?: TemplateMapping) => {
    if (template) {
      setEditingTemplate(template);
    } else {
      // Create new template
      setEditingTemplate({
        name: '',
        description: '',
        content: '',
        fields: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setIsEditing(true);
  };

  const handleSave = async (template: TemplateMapping) => {
    console.log('TemplateManager: Received template to save:', template);
    try {
      const templateToSave: TemplateMapping = {
        ...template,
        name: template.name,
        description: template.description || '',
        content: template.content,
        fields: template.fields,
        version: template.version,
        updatedAt: new Date().toISOString()
      };
      await onSave(templateToSave);
      console.log('TemplateManager: Template saved successfully');
      setIsEditing(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('TemplateManager: Error saving template:', error);
    }
  };

  const deleteTemplate = (templateId: string | undefined) => {
    if (!templateId) return;
    
    if (templates.length === 1) {
      alert('Cannot delete the last template');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this template?')) {
      onDelete(templateId);
    }
  };

  if (isEditing && editingTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {editingTemplate.id ? 'Edit Template' : 'Create Template'}
          </h3>
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
        <TemplateEditor
          template={editingTemplate}
          data={{}}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Templates</h3>
        <button
          onClick={() => startEdit()}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          // Ensure fields is an array
          const fields = Array.isArray(template.fields) ? template.fields : [];
          
          return (
            <div
              key={template.id || 'new'}
              className="bg-white rounded-lg shadow p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(template)}
                    className="text-gray-400 hover:text-gray-500"
                    title="Edit template"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {template.id && (
                    <button
                      onClick={() => template.id && deleteTemplate(template.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <p>Version: {template.version}</p>
                <p>Last updated: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700">Field Mappings:</h5>
                <ul className="mt-1 text-sm text-gray-500">
                  {fields.map((field) => (
                    <li key={field.id} className="flex items-center justify-between">
                      <span>{field.label}</span>
                      {field.excelColumn && (
                        <span className="text-gray-400">→ {field.excelColumn}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onSelect(template)}
                className="mt-2 w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Use Template
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
} 