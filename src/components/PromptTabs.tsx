'use client';

import { useState, useRef, useEffect } from 'react';
import { Maximize2, X, Copy, Save } from 'lucide-react';
import { ExcelRow, TemplateMapping, TemplateField, SavedPrompt } from '@/lib/types';
import { savedPromptService } from '@/lib/savedPromptService';

interface PromptTabsProps {
  data: ExcelRow[];
  template: TemplateMapping | null;
  initialSavedPrompt?: SavedPrompt;
}

export default function PromptTabs({ data, template, initialSavedPrompt }: PromptTabsProps) {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [expandedField, setExpandedField] = useState<TemplateField | null>(null);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(initialSavedPrompt?.id || null);
  const [folderName, setFolderName] = useState(initialSavedPrompt?.folderName || '');
  const [promptName, setPromptName] = useState(initialSavedPrompt?.promptName || '');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [existingFolders, setExistingFolders] = useState<string[]>([]);
  const [isNewFolder, setIsNewFolder] = useState(!initialSavedPrompt?.folderName);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize field values from Excel data
  useEffect(() => {
    if (template && data[activePromptIndex]) {
      const newFieldValues: Record<string, string> = {};
      template.fields.forEach(field => {
        if (!field.isManualEntry && field.excelColumn) {
          const excelValue = data[activePromptIndex][field.excelColumn];
          if (excelValue !== undefined && excelValue !== null) {
            newFieldValues[field.id] = field.type === 'array' 
              ? Array.isArray(excelValue) ? excelValue.join(', ') : String(excelValue)
              : String(excelValue);
          }
        }
      });
      setFieldValues(newFieldValues);
    }
  }, [template, data, activePromptIndex]);

  // Initialize field values from saved prompt if editing
  useEffect(() => {
    if (initialSavedPrompt && template) {
      const newFieldValues: Record<string, string> = {};
      template.fields.forEach(field => {
        const placeholder = `[${field.id.toUpperCase()}]`;
        const regex = new RegExp(placeholder + '([^[]*)', 'g');
        const matches = initialSavedPrompt.promptContent.match(regex);
        if (matches) {
          newFieldValues[field.id] = matches[0].replace(placeholder, '').trim();
        }
      });
      setFieldValues(newFieldValues);
    }
  }, [initialSavedPrompt, template]);

  // Load existing folders when save dialog opens
  useEffect(() => {
    const loadFolders = async () => {
      if (showSaveDialog) {
        try {
          const allPrompts = await savedPromptService.getAllPrompts();
          const folders = Array.from(new Set(allPrompts.map(p => p.folderName)));
          setExistingFolders(folders);
        } catch (err) {
          console.error('Failed to load folders:', err);
        }
      }
    };
    loadFolders();
  }, [showSaveDialog]);

  const updateField = (fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleExpandField = (field: TemplateField) => {
    setExpandedField(field);
    // Set the initial value after the component mounts
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.value = fieldValues[field.id] || '';
      }
    }, 0);
  };

  const handleCloseExpanded = () => {
    if (expandedField && textareaRef.current) {
      updateField(expandedField.id, textareaRef.current.value);
    }
    setExpandedField(null);
  };

  const generatePrompt = () => {
    if (!template) return '';
    let prompt = template.content;
    template.fields.forEach(field => {
      const value = fieldValues[field.id] || '';
      const placeholder = `[${field.id.toUpperCase()}]`;
      prompt = prompt.replaceAll(placeholder, value);
    });
    return prompt;
  };

  const handleSavePrompt = async () => {
    if (!template || !template.id) return;

    try {
      if (!folderName.trim()) {
        alert('Please enter a folder name');
        return;
      }

      if (!promptName.trim()) {
        alert('Please enter a prompt name');
        return;
      }

      const promptData = {
        templateId: template.id,
        folderName: folderName.trim(),
        promptContent: generatePrompt(),
        rowIndex: activePromptIndex,
        promptName: promptName.trim()
      };

      if (savedPromptId) {
        // Update existing prompt
        await savedPromptService.updatePrompt(savedPromptId, promptData);
      } else {
        // Create new prompt
        const saved = await savedPromptService.savePrompt(promptData);
        setSavedPromptId(saved.id);
      }

      setShowSaveDialog(false);
    } catch (err) {
      console.error('Failed to save prompt:', err);
      alert('Failed to save prompt. Please try again.');
    }
  };

  if (!template) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Select a template to start generating prompts</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available. Please upload an Excel file.
      </div>
    );
  }

  const renderField = (field: TemplateField) => {
    const value = fieldValues[field.id] || '';
    const excelValue = !field.isManualEntry && field.excelColumn ? data[activePromptIndex]?.[field.excelColumn] : '';

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
        <button
          onClick={() => handleExpandField(field)}
          className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600"
          title="Expand field"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Modal component for expanded field view
  const ExpandedFieldModal = () => {
    if (!expandedField) return null;

    const excelValue = !expandedField.isManualEntry && expandedField.excelColumn ? data[activePromptIndex]?.[expandedField.excelColumn] : '';

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === modalRef.current) {
            handleCloseExpanded();
          }
        }}
        ref={modalRef}
      >
        <div className="bg-white rounded-lg p-6 w-[80%] h-[80%] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{expandedField.label}</h3>
              <p className="text-sm text-gray-500">
                {expandedField.isManualEntry ? 'Manual Entry' : `Excel Column: ${expandedField.excelColumn}`}
              </p>
            </div>
            <button
              onClick={handleCloseExpanded}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {expandedField.type === 'textarea' ? (
                <textarea
                  ref={textareaRef}
                  placeholder={expandedField.placeholder}
                  className="w-full h-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : expandedField.type === 'array' ? (
                <div className="space-y-4">
                  <textarea
                    ref={textareaRef}
                    placeholder={expandedField.placeholder || "Enter comma-separated values"}
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {!expandedField.isManualEntry && expandedField.excelColumn && excelValue && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Excel Value:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{excelValue}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Enter values separated by commas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    ref={textareaRef}
                    placeholder={expandedField.placeholder}
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {!expandedField.isManualEntry && expandedField.excelColumn && excelValue && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Excel Value:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{excelValue}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Template Name */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
        {template.description && (
          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
        )}
      </div>

      {/* Row Navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setActivePromptIndex(prev => Math.max(0, prev - 1))}
          disabled={activePromptIndex === 0}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous Prompt
        </button>
        <span className="text-sm text-gray-500">
          Prompt {activePromptIndex + 1} of {data.length}
        </span>
        <button
          onClick={() => setActivePromptIndex(prev => Math.min(data.length - 1, prev + 1))}
          disabled={activePromptIndex === data.length - 1}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Prompt
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {template.fields.map((field) => (
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
            </div>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Generated Prompt */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generated Prompt</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatePrompt());
              }}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Copy prompt"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="p-2 text-blue-600 hover:text-blue-900"
              title={savedPromptId ? "Update prompt" : "Save prompt"}
            >
              <Save className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
              <h3 className="text-lg font-semibold mb-4">
                {savedPromptId ? 'Update Prompt' : 'Save Prompt'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt Name
                  </label>
                  <input
                    type="text"
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter a name for this prompt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder
                  </label>
                  {!isNewFolder ? (
                    <div className="space-y-2">
                      <select
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a folder</option>
                        {existingFolders.map((folder) => (
                          <option key={folder} value={folder}>
                            {folder}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsNewFolder(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Create New Folder
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter new folder name"
                      />
                      <button
                        onClick={() => setIsNewFolder(false)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        ← Choose Existing Folder
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    if (!savedPromptId) {
                      setFolderName('');
                      setPromptName('');
                      setIsNewFolder(false);
                    }
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrompt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {savedPromptId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded p-4">
          <pre className="whitespace-pre-wrap text-sm">{generatePrompt()}</pre>
        </div>
      </div>

      {/* Expanded Field Modal */}
      <ExpandedFieldModal />
    </div>
  );
} 