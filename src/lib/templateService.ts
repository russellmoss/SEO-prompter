import { supabase } from './supabase';
import { TemplateMapping } from './types';

export const templateService = {
  async getTemplates(): Promise<TemplateMapping[]> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      return data.map(template => ({
        ...template,
        fields: typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }));
    } catch (error) {
      console.error('Error in getTemplates:', error);
      throw error;
    }
  },

  async saveTemplate(template: TemplateMapping): Promise<TemplateMapping> {
    try {
      // Log the incoming template data
      console.log('Raw template data:', JSON.stringify(template, null, 2));

      // Check each required field individually
      const requiredFields = {
        name: template.name?.trim(),
        content: template.content?.trim(),
        fields: template.fields,
        version: template.version
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Transform the data to match Supabase schema
      const templateData = {
        // Only include id if it's a valid UUID
        ...(template.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(template.id) 
          ? { id: template.id } 
          : {}),
        name: template.name.trim(),
        description: template.description?.trim() || '', // Make description optional with empty string fallback
        content: template.content.trim(),
        fields: JSON.stringify(template.fields),
        version: template.version,
        created_at: template.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Transformed template data for Supabase:', JSON.stringify(templateData, null, 2));

      const { data, error } = await supabase
        .from('templates')
        .upsert(templateData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving template:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from Supabase');
      }

      // Transform the response back to our application format
      const savedTemplate = {
        ...data,
        fields: typeof data.fields === 'string' ? JSON.parse(data.fields) : data.fields,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      console.log('Successfully saved template:', savedTemplate);
      return savedTemplate;
    } catch (error) {
      console.error('Error in saveTemplate:', error);
      throw error;
    }
  },

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      throw error;
    }
  }
}; 