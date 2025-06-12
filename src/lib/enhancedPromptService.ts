import { supabase } from './supabase';
import { SavedPrompt, ContentAnalysis, EnhancedExcelRow } from './types';
import { EnhancedExcelParser } from './enhancedExcelParser';

// Extend SavedPrompt type to include content analysis
interface EnhancedSavedPrompt extends SavedPrompt {
  content_analysis?: ContentAnalysis;
}

export const enhancedPromptService = {
  async savePrompt(prompt: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>, analysis: ContentAnalysis): Promise<SavedPrompt> {
    const { data, error } = await supabase
      .from('saved_prompts')
      .insert([{
        template_id: prompt.templateId,
        folder_name: prompt.folderName,
        prompt_name: prompt.promptName,
        prompt_content: prompt.promptContent,
        row_index: prompt.rowIndex,
        content_analysis: analysis
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

  async updatePrompt(id: string, prompt: Partial<SavedPrompt>, analysis?: ContentAnalysis): Promise<SavedPrompt> {
    const updateData: any = {
      template_id: prompt.templateId,
      folder_name: prompt.folderName,
      prompt_name: prompt.promptName,
      prompt_content: prompt.promptContent,
      row_index: prompt.rowIndex
    };

    if (analysis) {
      updateData.content_analysis = analysis;
    }

    const { data, error } = await supabase
      .from('saved_prompts')
      .update(updateData)
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
  },

  async analyzeContentCalendar(excelData: EnhancedExcelRow[]): Promise<ContentAnalysis> {
    // Use the static method for content analysis
    const analysis = await EnhancedExcelParser.analyzeContentHolistically(excelData);
    
    // Convert ContentAnalysisResult to ContentAnalysis
    return {
      id: crypto.randomUUID(),
      templateId: '',
      excelData: excelData as any, // Type assertion to handle the index signature issue
      currentRowIndex: 0,
      semanticAnalysis: analysis.semanticAnalysis,
      internalLinkSuggestions: analysis.internalLinkOpportunities,
      externalLinkSuggestions: [],
      photoSuggestions: [],
      contentRequirements: '',
      createdAt: new Date().toISOString()
    };
  },

  async getSimilarPrompts(promptId: string, threshold: number = 0.3): Promise<SavedPrompt[]> {
    const prompt = await this.getPromptById(promptId);
    const allPrompts = await this.getAllPrompts();
    
    // Get content analysis for the current prompt
    const { data: currentAnalysis } = await supabase
      .from('saved_prompts')
      .select('content_analysis')
      .eq('id', promptId)
      .single();

    if (!currentAnalysis?.content_analysis) {
      return [];
    }

    // Find similar prompts based on semantic analysis
    const similarPrompts = allPrompts.filter(p => {
      if (p.id === promptId) return false;
      
      // Get content analysis for the comparison prompt
      const comparisonAnalysis = (p as EnhancedSavedPrompt).content_analysis;
      if (!comparisonAnalysis) return false;
      
      // Calculate similarity based on content analysis
      const similarity = this.calculateSimilarity(
        currentAnalysis.content_analysis,
        comparisonAnalysis
      );
      
      return similarity >= threshold;
    });

    return similarPrompts;
  },

  calculateSimilarity(analysis1: ContentAnalysis, analysis2: ContentAnalysis): number {
    // Calculate similarity based on semantic analysis
    const semanticSimilarity = this.calculateSemanticSimilarity(
      analysis1.semanticAnalysis,
      analysis2.semanticAnalysis
    );

    // Calculate similarity based on internal link suggestions
    const linkSimilarity = this.calculateLinkSimilarity(
      analysis1.internalLinkSuggestions,
      analysis2.internalLinkSuggestions
    );

    // Weight the similarities (adjust weights as needed)
    return (semanticSimilarity * 0.7) + (linkSimilarity * 0.3);
  },

  calculateSemanticSimilarity(analysis1: any, analysis2: any): number {
    // Implement semantic similarity calculation
    // This could use various metrics like:
    // - Similarity of keywords
    // - Similarity of content structure
    // - Similarity of topics
    return 0.5; // Placeholder implementation
  },

  calculateLinkSimilarity(links1: any[], links2: any[]): number {
    // Implement link similarity calculation
    // This could compare:
    // - Common link targets
    // - Similar anchor text
    // - Similar relevance scores
    return 0.5; // Placeholder implementation
  }
}; 