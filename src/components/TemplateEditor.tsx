'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Plus, Trash2, Info, Maximize2, X, Pencil } from 'lucide-react';
import { TemplateMapping, ExcelRow, TemplateField } from '@/lib/types';

interface TemplateEditorProps {
  template: TemplateMapping;
  data: ExcelRow;
  onSave: (template: TemplateMapping) => void;
}

export default function TemplateEditor({ template, data, onSave }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<TemplateMapping>(template);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [expandedField, setExpandedField] = useState<TemplateField | null>(null);
  const [editingField, setEditingField] = useState<TemplateField | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
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
  const [error, setError] = useState<string | null>(null);

  // Generate column letters A-Z, AA-AZ, etc.
  const generateColumnLetters = (count: number = 40) => {
    const letters: string[] = [];
    for (let i = 0; i < count; i++) {
      let columnLetter = '';
      let num = i;
      while (num >= 0) {
        columnLetter = String.fromCharCode(65 + (num % 26)) + columnLetter;
        num = Math.floor(num / 26) - 1;
      }
      letters.push(columnLetter);
    }
    return letters;
  };

  const columnLetters = generateColumnLetters(40); // This will generate A through AN

  useEffect(() => {
    // Initialize field values from Excel data
    const initialValues: Record<string, string> = {};
    console.log('Initializing field values from Excel data:', data);
    editedTemplate.fields.forEach(field => {
      console.log('Processing field:', field.label, 'Excel Column:', field.excelColumn);
      if (!field.isManualEntry && field.excelColumn) {
        // Get the value from the Excel data using the column letter
        const value = data[field.excelColumn];
        console.log('Excel value for', field.label, ':', value);
        if (value) {
          if (field.type === 'array') {
            // Handle array type fields
            initialValues[field.id] = value.includes(',') ? value : `[${value}]`;
          } else {
            initialValues[field.id] = value;
          }
        } else {
          initialValues[field.id] = '';
        }
      } else {
        initialValues[field.id] = '';
      }
    });
    console.log('Initialized field values:', initialValues);
    setFieldValues(initialValues);
  }, [editedTemplate.fields, data]);

  const generatePrompt = () => {
    let prompt = editedTemplate.content;
    editedTemplate.fields.forEach(field => {
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

    // Reset new field form
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

  const removeField = (fieldId: string) => {
    setEditedTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  };

  const insertFieldPlaceholder = (fieldId: string) => {
    const placeholder = `[${fieldId.toUpperCase()}]`;
    if (cursorPosition !== null && contentTextareaRef.current) {
      const textarea = contentTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editedTemplate.content;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      
      setEditedTemplate(prev => ({
        ...prev,
        content: newText
      }));

      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        if (contentTextareaRef.current) {
          const newCursorPos = start + placeholder.length;
          contentTextareaRef.current.focus();
          contentTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTemplate(prev => ({ ...prev, content: e.target.value }));
    setCursorPosition(e.target.selectionStart);
  };

  const handleContentClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const handleContentKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const renderField = (field: TemplateMapping['fields'][0]) => {
    const value = fieldValues[field.id] || '';
    const excelValue = !field.isManualEntry && field.excelColumn ? data[field.excelColumn] : '';
    console.log('Rendering field:', field.label, {
      fieldId: field.id,
      value,
      excelValue,
      excelColumn: field.excelColumn,
      isManualEntry: field.isManualEntry
    });

    const fieldContent = (
      <>
        {field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        ) : field.type === 'array' ? (
          <div className="space-y-1">
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder || "Enter comma-separated values"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {!field.isManualEntry && field.excelColumn && excelValue && (
              <p className="text-xs text-gray-500">
                Excel value: {excelValue}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter values separated by commas
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {!field.isManualEntry && field.excelColumn && excelValue && (
              <p className="text-xs text-gray-500">
                Excel value: {excelValue}
              </p>
            )}
          </div>
        )}
      </>
    );

    return (
      <div key={field.id} className="relative">
        {fieldContent}
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button
            onClick={() => setEditingField(field)}
            className="text-gray-400 hover:text-gray-600"
            title="Edit field"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExpandedField(field)}
            className="text-gray-400 hover:text-gray-600"
            title="Expand field"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const handleSave = () => {
    const updatedTemplate: TemplateMapping = {
      ...template,
      name: editedTemplate.name,
      description: editedTemplate.description || '',
      content: editedTemplate.content,
      fields: editedTemplate.fields,
      version: Number(template.version || 1),
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(updatedTemplate);
  };

  // Modal component for expanded field view
  const ExpandedFieldModal = () => {
    if (!expandedField) return null;

    const value = fieldValues[expandedField.id] || '';
    const excelValue = !expandedField.isManualEntry && expandedField.excelColumn ? data[expandedField.excelColumn] : '';

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === modalRef.current) {
            setExpandedField(null);
          }
        }}
        ref={modalRef}
      >
        <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{expandedField.label}</h3>
              <p className="text-sm text-gray-500">
                {expandedField.isManualEntry ? 'Manual Entry' : `Excel Column: ${expandedField.excelColumn}`}
              </p>
            </div>
            <button
              onClick={() => setExpandedField(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {expandedField.type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => updateField(expandedField.id, e.target.value)}
                placeholder={expandedField.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={10}
              />
            ) : expandedField.type === 'array' ? (
              <div className="space-y-2">
                <textarea
                  value={value}
                  onChange={(e) => updateField(expandedField.id, e.target.value)}
                  placeholder={expandedField.placeholder || "Enter comma-separated values"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={5}
                />
                {!expandedField.isManualEntry && expandedField.excelColumn && excelValue && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Excel Value:</p>
                    <p className="text-sm text-gray-600">{excelValue}</p>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Enter values separated by commas
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={value}
                  onChange={(e) => updateField(expandedField.id, e.target.value)}
                  placeholder={expandedField.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={5}
                />
                {!expandedField.isManualEntry && expandedField.excelColumn && excelValue && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Excel Value:</p>
                    <p className="text-sm text-gray-600">{excelValue}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal component for editing field properties
  const EditFieldModal = () => {
    if (!editingField) return null;

    const handleFieldUpdate = (updatedField: TemplateField) => {
      setEditedTemplate(prev => ({
        ...prev,
        fields: prev.fields.map(f => f.id === updatedField.id ? updatedField : f)
      }));
      setEditingField(null);
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === modalRef.current) {
            setEditingField(null);
          }
        }}
        ref={modalRef}
      >
        <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Edit Field Properties</h3>
            <button
              onClick={() => setEditingField(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <input
                type="text"
                value={editingField.label}
                onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={editingField.type}
                onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Text</option>
                <option value="textarea">Text Area</option>
                <option value="array">Array</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Excel Column</label>
              <select
                value={editingField.excelColumn}
                onChange={(e) => setEditingField({ ...editingField, excelColumn: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a column</option>
                {columnLetters.map(letter => (
                  <option key={letter} value={letter}>{letter}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Placeholder</label>
              <input
                type="text"
                value={editingField.placeholder}
                onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editingField.description}
                onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={editingField.required}
                onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
                Required
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isManualEntry"
                checked={editingField.isManualEntry}
                onChange={(e) => setEditingField({ ...editingField, isManualEntry: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isManualEntry" className="ml-2 block text-sm text-gray-700">
                Manual Entry Only
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFieldUpdate(editingField)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

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
            placeholder="Enter template name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            placeholder="Enter template description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{editedTemplate.name}</h3>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>

      {/* Template Content Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template Content
        </label>
        <div className="relative">
          <textarea
            ref={contentTextareaRef}
            value={editedTemplate.content}
            onChange={handleContentChange}
            onClick={handleContentClick}
            onKeyUp={handleContentKeyUp}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your template content here. Use [FIELD_NAME] to insert field values."
          />
          <div className="absolute top-2 right-2 text-xs text-gray-500">
            <Info className="h-4 w-4 inline mr-1" />
            Click the + button next to a field to insert it at cursor position
          </div>
        </div>
      </div>

      {/* Add New Field Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Field</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Label
            </label>
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., Title, Keywords"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excel Column
            </label>
            <select
              value={newField.excelColumn}
              onChange={(e) => setNewField(prev => ({ ...prev, excelColumn: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={newField.isManualEntry}
            >
              <option value="">Select a column</option>
              {columnLetters.map(letter => (
                <option key={letter} value={letter}>
                  Column {letter}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              First row is treated as header. Each row represents a new prompt.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Type
            </label>
            <select
              value={newField.type}
              onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value as TemplateField['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text">Text</option>
              <option value="textarea">Text Area</option>
              <option value="array">Array (comma-separated)</option>
              <option value="html">HTML</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newField.isManualEntry}
                onChange={(e) => {
                  setNewField(prev => ({ 
                    ...prev, 
                    isManualEntry: e.target.checked,
                    excelColumn: e.target.checked ? '' : prev.excelColumn 
                  }));
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Manual Entry Only</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={addField}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </button>
          </div>
        </div>
      </div>

      {/* Field List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editedTemplate.fields.map((field) => (
          <div key={field.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {!field.isManualEntry && field.excelColumn && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Excel: Column {field.excelColumn})
                    </span>
                  )}
                  {field.isManualEntry && (
                    <span className="text-xs text-blue-500 ml-2">
                      (Manual Entry)
                    </span>
                  )}
                </label>
                <p className="text-xs text-gray-500">{field.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => insertFieldPlaceholder(field.id)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Insert field into template"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeField(field.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Expanded Field Modal */}
      <ExpandedFieldModal />

      {/* Edit Field Modal */}
      <EditFieldModal />

      {/* Generated Prompt Preview */}
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Template
        </button>
      </div>
    </div>
  );
} 