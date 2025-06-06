import { TemplateMapping } from './types';

export const defaultMileaTemplate: TemplateMapping = {
  id: 'default-milea',
  name: 'Default Milea Blog Template',
  description: 'Standard template for Milea Estate Vineyard blog posts',
  content: `# {{title}}

{{introduction}}

## Main Content
{{main_content}}

## Conclusion
{{conclusion}}

REMEMBER: Always maintain the luxury vineyard aesthetic, include proper spacing with clearfix classes, and ensure all styling is contained within the .milea-blog-content wrapper to prevent website header conflicts.`,
  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'Blog Title',
      type: 'text',
      placeholder: 'Enter the blog post title',
      excelColumn: 'A',
      required: true,
      description: 'The main title of the blog post',
      isManualEntry: false
    },
    {
      id: 'keywords',
      name: 'keywords',
      label: 'Target Keywords',
      type: 'array',
      placeholder: 'Enter target keywords separated by commas',
      excelColumn: 'B',
      required: true,
      description: 'Main keywords to target in the blog post',
      isManualEntry: false
    },
    {
      id: 'introduction',
      name: 'introduction',
      label: 'Introduction',
      type: 'textarea',
      placeholder: 'Enter the introduction paragraph',
      excelColumn: 'C',
      required: true,
      description: 'Opening paragraph that hooks the reader',
      isManualEntry: false
    },
    {
      id: 'main_content',
      name: 'main_content',
      label: 'Main Content',
      type: 'textarea',
      placeholder: 'Enter the main content',
      excelColumn: 'D',
      required: true,
      description: 'The main body of the blog post',
      isManualEntry: false
    },
    {
      id: 'conclusion',
      name: 'conclusion',
      label: 'Conclusion',
      type: 'textarea',
      placeholder: 'Enter the conclusion paragraph',
      excelColumn: 'E',
      required: true,
      description: 'Closing paragraph that summarizes the post',
      isManualEntry: false
    }
  ],
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const wineEducationTemplate: TemplateMapping = {
  id: 'wine-education',
  name: 'Wine Education Guide',
  description: 'Comprehensive guide about wine types, characteristics, and appreciation',
  content: `# {{wine_type}} Guide

## Understanding {{wine_type}}

{{wine_type}} is a distinctive wine style that offers a unique experience for wine enthusiasts. Let's explore its key characteristics and what makes it special.

### Key Characteristics
{{#each key_characteristics}}
- {{this}}
{{/each}}

### Flavor Profile
The flavor profile of {{wine_type}} is complex and nuanced, featuring:
{{#each flavor_profile}}
- {{this}}
{{/each}}

## Food Pairings
{{food_pairings}}

## Serving and Storage
- Optimal serving temperature: {{serving_temperature}}
- Aging potential: {{aging_potential}}
- Storage recommendations: {{storage_advice}}

## Production and Origin
{{production_methods}}

### Regional Information
{{region_info}}

### Vintage Considerations
{{vintage_notes}}

## Expert Tips
- Store bottles horizontally in a cool, dark place
- Allow the wine to breathe before serving
- Consider the vintage when planning to age the wine

## Conclusion
{{wine_type}} offers a unique experience that combines tradition with modern winemaking techniques. Whether you're a novice or a connoisseur, understanding these aspects will enhance your appreciation of this remarkable wine.`,
  fields: [
    {
      id: 'wine_type',
      name: 'wine_type',
      label: 'Wine Type',
      type: 'text',
      placeholder: 'Enter the type of wine',
      excelColumn: 'A',
      required: true,
      description: 'The specific type of wine being discussed',
      isManualEntry: false
    },
    {
      id: 'key_characteristics',
      name: 'key_characteristics',
      label: 'Key Characteristics',
      type: 'array',
      placeholder: 'Enter key characteristics separated by commas',
      excelColumn: 'B',
      required: false,
      description: 'Main characteristics of the wine',
      isManualEntry: false
    },
    {
      id: 'flavor_profile',
      name: 'flavor_profile',
      label: 'Flavor Profile',
      type: 'array',
      placeholder: 'Enter flavor notes separated by commas',
      excelColumn: 'C',
      required: false,
      description: 'Detailed flavor profile of the wine',
      isManualEntry: false
    },
    {
      id: 'food_pairings',
      name: 'food_pairings',
      label: 'Food Pairings',
      type: 'text',
      placeholder: 'Enter recommended food pairings',
      excelColumn: 'D',
      required: false,
      description: 'Suggested food pairings for the wine',
      isManualEntry: false
    },
    {
      id: 'serving_temperature',
      name: 'serving_temperature',
      label: 'Serving Temperature',
      type: 'text',
      placeholder: 'Enter optimal serving temperature',
      excelColumn: 'E',
      required: false,
      description: 'Recommended serving temperature',
      isManualEntry: false
    },
    {
      id: 'aging_potential',
      name: 'aging_potential',
      label: 'Aging Potential',
      type: 'text',
      placeholder: 'Enter aging recommendations',
      excelColumn: 'F',
      required: false,
      description: 'Information about aging potential',
      isManualEntry: false
    },
    {
      id: 'production_methods',
      name: 'production_methods',
      label: 'Production Methods',
      type: 'text',
      placeholder: 'Enter production methods',
      excelColumn: 'G',
      required: false,
      description: 'Details about how the wine is produced',
      isManualEntry: false
    },
    {
      id: 'region_info',
      name: 'region_info',
      label: 'Region Information',
      type: 'text',
      placeholder: 'Enter region details',
      excelColumn: 'H',
      required: false,
      description: 'Information about the wine region',
      isManualEntry: false
    },
    {
      id: 'vintage_notes',
      name: 'vintage_notes',
      label: 'Vintage Notes',
      type: 'text',
      placeholder: 'Enter vintage information',
      excelColumn: 'I',
      required: false,
      description: 'Notes about specific vintages',
      isManualEntry: false
    },
    {
      id: 'storage_advice',
      name: 'storage_advice',
      label: 'Storage Advice',
      type: 'text',
      placeholder: 'Enter storage recommendations',
      excelColumn: 'J',
      required: false,
      description: 'Advice on proper wine storage',
      isManualEntry: false
    }
  ],
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const getTemplates = (): TemplateMapping[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('prompt-templates');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return [defaultMileaTemplate, wineEducationTemplate];
};

export const saveTemplates = (templates: TemplateMapping[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prompt-templates', JSON.stringify(templates));
  }
}; 