'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { ContentCalendarTemplate, TemplateField, OutputField } from '@/lib/types';

interface ContentCalendarTemplateEditorProps {
  template: ContentCalendarTemplate;
  onSave: (template: ContentCalendarTemplate) => void;
  onCancel: () => void;
}

export default function ContentCalendarTemplateEditor({ 
  template, 
  onSave,
  onCancel 
}: ContentCalendarTemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<ContentCalendarTemplate>(template);
  const [newField, setNewField] = useState<Omit<TemplateField, 'id'>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    excelColumn: '',
    placeholder: '',
    description: '',
    isManualEntry: false
  });
  const [newOutputField, setNewOutputField] = useState<Omit<OutputField, 'id'>>({
    name: '',
    label: '',
    description: '',
    type: 'text'
  });
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const addField = () => {
    if (!newField.label) return;

    const field: TemplateField = {
      ...newField,
      id: newField.label.toLowerCase().replace(/\s+/g, '_')
    };

    setEditedTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, field]
    }));

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      excelColumn: '',
      placeholder: '',
      description: '',
      isManualEntry: false
    });
  };

  const addOutputField = () => {
    if (!newOutputField.label) return;

    const field: OutputField = {
      ...newOutputField,
      id: newOutputField.label.toLowerCase().replace(/\s+/g, '_')
    };

    setEditedTemplate(prev => ({
      ...prev,
      outputFields: [...prev.outputFields, field]
    }));

    setNewOutputField({
      name: '',
      label: '',
      description: '',
      type: 'text'
    });
  };

  const removeField = (fieldId: string) => {
    setEditedTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  };

  const removeOutputField = (fieldId: string) => {
    setEditedTemplate(prev => ({
      ...prev,
      outputFields: prev.outputFields.filter(f => f.id !== fieldId)
    }));
  };

  const insertFieldPlaceholder = (fieldId: string) => {
    const placeholder = `{{${fieldId}}}`;
    if (promptTextareaRef.current) {
      const textarea = promptTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editedTemplate.prompt;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      
      setEditedTemplate(prev => ({
        ...prev,
        prompt: newText
      }));

      setTimeout(() => {
        if (promptTextareaRef.current) {
          const newCursorPos = start + placeholder.length;
          promptTextareaRef.current.focus();
          promptTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleSave = () => {
    const templateToSave: ContentCalendarTemplate = {
      ...editedTemplate,
      version: Number(editedTemplate.version || 1),
      updatedAt: new Date().toISOString()
    };
    onSave(templateToSave);
  };

  return (
    <div className="space-y-6">
      {/* Template Name and Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name *
          </label>
          <input
            type="text"
            value={editedTemplate.name}
            onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Content Calendar Analysis"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={editedTemplate.description}
            onChange={(e) => setEditedTemplate(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this template analyzes"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Input Fields */}
      <div>
        <h3 className="text-lg font-medium mb-3">Input Fields (from Excel)</h3>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Input Field</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Field Label"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newField.excelColumn}
              onChange={(e) => setNewField(prev => ({ ...prev, excelColumn: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Excel Column</option>
              {Array.from({ length: 40 }, (_, i) => {
                let columnLetter = '';
                let num = i;
                while (num >= 0) {
                  columnLetter = String.fromCharCode(65 + (num % 26)) + columnLetter;
                  num = Math.floor(num / 26) - 1;
                }
                return columnLetter;
              }).map(letter => (
                <option key={letter} value={letter}>Column {letter}</option>
              ))}
            </select>
            <button
              onClick={addField}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add Field
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {editedTemplate.fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <span className="font-medium">{field.label}</span>
                <span className="text-sm text-gray-500 ml-2">(Column {field.excelColumn})</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => insertFieldPlaceholder(field.id)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Insert into prompt"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeField(field.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Claude Prompt Template
        </label>
        <div className="relative">
          <textarea
            ref={promptTextareaRef}
            value={editedTemplate.prompt}
            onChange={(e) => setEditedTemplate(prev => ({ ...prev, prompt: e.target.value }))}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Write your prompt here. Use {{fieldId}} to insert field values."
          />
          <div className="absolute top-2 right-2 text-xs text-gray-500">
            <Info className="h-4 w-4 inline mr-1" />
            Click the + button next to a field to insert it
          </div>
        </div>
      </div>

      {/* Output Fields */}
      <div>
        <h3 className="text-lg font-medium mb-3">Expected Output Fields</h3>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Expected Output</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newOutputField.label}
              onChange={(e) => setNewOutputField(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Output Field Label"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newOutputField.type}
              onChange={(e) => setNewOutputField(prev => ({ ...prev, type: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="text">Text</option>
              <option value="array">Array</option>
              <option value="textarea">Text Area</option>
            </select>
            <button
              onClick={addOutputField}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add Output
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {editedTemplate.outputFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <span className="font-medium">{field.label}</span>
                <span className="text-sm text-gray-500 ml-2">({field.type})</span>
              </div>
              <button
                onClick={() => removeOutputField(field.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Template
        </button>
      </div>
    </div>
  );
} 