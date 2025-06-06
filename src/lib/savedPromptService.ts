import { supabase } from './supabase';
import { SavedPrompt } from './types';

export const savedPromptService = {
  async savePrompt(prompt: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedPrompt> {
    const { data, error } = await supabase
      .from('saved_prompts')
      .insert([{
        template_id: prompt.templateId,
        folder_name: prompt.folderName,
        prompt_name: prompt.promptName,
        prompt_content: prompt.promptContent,
        row_index: prompt.rowIndex
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving prompt:', error);
      throw error;
    }

    return {
      id: data.id,
      templateId: data.template_id,
      folderName: data.folder_name,
      promptName: data.prompt_name,
      promptContent: data.prompt_content,
      rowIndex: data.row_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updatePrompt(id: string, prompt: Partial<SavedPrompt>): Promise<SavedPrompt> {
    const { data, error } = await supabase
      .from('saved_prompts')
      .update({
        template_id: prompt.templateId,
        folder_name: prompt.folderName,
        prompt_name: prompt.promptName,
        prompt_content: prompt.promptContent,
        row_index: prompt.rowIndex
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }

    return {
      id: data.id,
      templateId: data.template_id,
      folderName: data.folder_name,
      promptName: data.prompt_name,
      promptContent: data.prompt_content,
      rowIndex: data.row_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async getPromptsByFolder(folderName: string): Promise<SavedPrompt[]> {
    const { data, error } = await supabase
      .from('saved_prompts')
      .select('*')
      .eq('folder_name', folderName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }

    return data.map(prompt => ({
      id: prompt.id,
      templateId: prompt.template_id,
      folderName: prompt.folder_name,
      promptName: prompt.prompt_name,
      promptContent: prompt.prompt_content,
      rowIndex: prompt.row_index,
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at
    }));
  },

  async getPromptById(id: string): Promise<SavedPrompt> {
    const { data, error } = await supabase
      .from('saved_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching prompt:', error);
      throw error;
    }

    return {
      id: data.id,
      templateId: data.template_id,
      folderName: data.folder_name,
      promptName: data.prompt_name,
      promptContent: data.prompt_content,
      rowIndex: data.row_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async getAllPrompts(): Promise<SavedPrompt[]> {
    const { data, error } = await supabase
      .from('saved_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all prompts:', error);
      throw error;
    }

    return data.map(prompt => ({
      id: prompt.id,
      templateId: prompt.template_id,
      folderName: prompt.folder_name,
      promptName: prompt.prompt_name,
      promptContent: prompt.prompt_content,
      rowIndex: prompt.row_index,
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at
    }));
  },

  async deletePrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }
}; 