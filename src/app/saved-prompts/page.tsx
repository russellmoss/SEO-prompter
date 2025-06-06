'use client';

import { useEffect, useState } from 'react';
import { savedPromptService } from '@/lib/savedPromptService';
import { templateService } from '@/lib/templateService';
import { SavedPrompt, TemplateMapping } from '@/lib/types';
import { Copy, Trash2, Edit2, FolderOpen, ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function SavedPromptsPage() {
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [templates, setTemplates] = useState<Record<string, TemplateMapping>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load all folders and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        const allPrompts = await savedPromptService.getAllPrompts();
        const uniqueFolders = Array.from(new Set(allPrompts.map((p: SavedPrompt) => p.folderName)));
        setFolders(uniqueFolders);

        const allTemplates = await templateService.getTemplates();
        const templateMap = allTemplates.reduce((acc, template) => {
          if (template.id) {
            acc[template.id] = template;
          }
          return acc;
        }, {} as Record<string, TemplateMapping>);
        setTemplates(templateMap);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load prompts when folder is selected
  useEffect(() => {
    const loadPrompts = async () => {
      if (!selectedFolder) return;

      try {
        setLoading(true);
        const folderPrompts = await savedPromptService.getPromptsByFolder(selectedFolder);
        setPrompts(folderPrompts);
      } catch (err) {
        setError('Failed to load prompts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPrompts();
  }, [selectedFolder]);

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      await savedPromptService.deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
    } catch (err) {
      setError('Failed to delete prompt');
      console.error(err);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${folderName}" and all its prompts?`)) return;

    try {
      // Get all prompts in the folder
      const folderPrompts = await savedPromptService.getPromptsByFolder(folderName);
      
      // Delete each prompt in the folder
      for (const prompt of folderPrompts) {
        await savedPromptService.deletePrompt(prompt.id);
      }

      // Update the folders list
      setFolders(folders.filter(f => f !== folderName));
      
      // If the deleted folder was selected, clear the selection
      if (selectedFolder === folderName) {
        setSelectedFolder('');
        setPrompts([]);
      }
    } catch (err) {
      setError('Failed to delete folder');
      console.error(err);
    }
  };

  const handleEditPrompt = async (prompt: SavedPrompt) => {
    try {
      const updatedPrompt = await savedPromptService.updatePrompt(prompt.id, prompt);
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
      setSelectedPrompt(updatedPrompt);
      
      // Show success state
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      setError('Failed to update prompt');
      console.error(err);
    }
  };

  if (loading && folders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Prompts</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Generator
        </Link>
      </div>
      
      {/* Folder Selection */}
      {!selectedFolder && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 flex justify-between items-center"
              >
                <button
                  onClick={() => setSelectedFolder(folder)}
                  className="flex items-center space-x-2 flex-grow"
                >
                  <FolderOpen className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{folder}</span>
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder)}
                  className="p-2 text-red-600 hover:text-red-900 ml-2"
                  title="Delete folder"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompts List */}
      {selectedFolder && !selectedPrompt && (
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedFolder('')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Folders
            </button>
            <h2 className="text-lg font-semibold">
              Prompts in {selectedFolder}
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No prompts in this folder
            </div>
          ) : (
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 flex justify-between items-center"
                >
                  <button
                    onClick={() => setSelectedPrompt(prompt)}
                    className="flex-grow text-left"
                  >
                    <div>
                      <h3 className="font-medium">{prompt.promptName}</h3>
                      <p className="text-sm text-gray-500">
                        Template: {templates[prompt.templateId]?.name || 'Unknown Template'}
                      </p>
                    </div>
                  </button>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedPrompt(prompt)}
                      className="p-2 text-blue-600 hover:text-blue-900"
                      title="Edit prompt"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-2 text-red-600 hover:text-red-900"
                      title="Delete prompt"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Prompt View */}
      {selectedPrompt && (
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedPrompt(null)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to List
            </button>
            <h2 className="text-lg font-semibold">
              {selectedPrompt.promptName}
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">
                  Template: {templates[selectedPrompt.templateId]?.name || 'Unknown Template'}
                </p>
                <p className="text-sm text-gray-500">
                  Row {selectedPrompt.rowIndex + 1} • Saved {new Date(selectedPrompt.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopyPrompt(selectedPrompt.promptContent)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Copy prompt"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeletePrompt(selectedPrompt.id)}
                  className="p-2 text-red-600 hover:text-red-900"
                  title="Delete prompt"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <textarea
                value={selectedPrompt.promptContent}
                onChange={(e) => setSelectedPrompt({ ...selectedPrompt, promptContent: e.target.value })}
                className="w-full h-40 p-2 border border-gray-300 rounded-md"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditPrompt(selectedPrompt)}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200 ${
                    saveSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 