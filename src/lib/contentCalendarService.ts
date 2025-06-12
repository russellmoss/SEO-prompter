import { supabase } from './supabase';
import { ContentCalendarTemplate } from './types';

export const contentCalendarService = {
  async getTemplates(): Promise<ContentCalendarTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('content_calendar_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(template => ({
        ...template,
        fields: typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields,
        outputFields: typeof template.output_fields === 'string' ? JSON.parse(template.output_fields) : template.output_fields,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }));
    } catch (error) {
      console.error('Error fetching content calendar templates:', error);
      throw error;
    }
  },

  async saveTemplate(template: ContentCalendarTemplate): Promise<ContentCalendarTemplate> {
    try {
      const templateData = {
        name: template.name,
        description: template.description || '',
        prompt: template.prompt,
        fields: JSON.stringify(template.fields),
        output_fields: JSON.stringify(template.outputFields),
        version: template.version,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('content_calendar_templates')
        .upsert(templateData)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        fields: JSON.parse(data.fields),
        outputFields: JSON.parse(data.output_fields),
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error saving content calendar template:', error);
      throw error;
    }
  },

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_calendar_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content calendar template:', error);
      throw error;
    }
  },

  async getTemplateById(templateId: string): Promise<ContentCalendarTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('content_calendar_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No template found
        }
        throw error;
      }

      return {
        ...data,
        fields: JSON.parse(data.fields),
        outputFields: JSON.parse(data.output_fields),
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching content calendar template:', error);
      throw error;
    }
  }
}; 