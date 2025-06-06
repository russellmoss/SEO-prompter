// TODO: Define types 

export interface ExcelRow {
  [key: string]: string;
}

export interface PromptField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'array';
  placeholder: string;
  excelColumn?: string;
  required: boolean;
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  description?: string;
  type: 'text' | 'array' | 'textarea';
  required: boolean;
  excelColumn?: string;
  isManualEntry: boolean;
  placeholder?: string;
}

export interface TemplateMapping {
  id?: string;
  name: string;
  description?: string;
  content: string;
  fields: Array<{
    id: string;
    name: string;
    label: string;
    description?: string;
    type: 'text' | 'array';
    required: boolean;
    excelColumn?: string;
    isManualEntry: boolean;
  }>;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  fields: PromptField[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedPrompt {
  id: string;
  templateId: string;
  content: string;
  metadata: {
    title: string;
    keywords: string[];
    createdAt: string;
    excelRow: ExcelRow;
  };
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  fields: Array<{
    name: string;
    label: string;
    description?: string;
    type: 'text' | 'array';
    required: boolean;
  }>;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedPrompt {
  id: string;
  templateId: string;
  folderName: string;
  promptName: string;
  promptContent: string;
  rowIndex: number;
  createdAt: string;
  updatedAt: string;
} 