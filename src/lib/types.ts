// Define a common field type for consistency
type FieldType = 'text' | 'array' | 'textarea' | 'html' | 'image';

// Define a common field interface for reuse
interface BaseField {
  name: string;
  label: string;
  description?: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: string) => boolean;
  };
}

// TODO: Define types 

export interface ExcelRow {
  [key: string]: string;
}

export interface PromptField extends BaseField {
  id: string;
  excelColumn?: string;
}

export interface TemplateField extends BaseField {
  id: string;
  excelColumn?: string;
  isManualEntry: boolean;
  defaultValue?: string | string[];
}

export interface TemplateMapping {
  id?: string;
  name: string;
  description?: string;
  content: string;
  fields: Array<TemplateField>;
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
  fields: Array<BaseField>;
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

// Content Calendar Types
export interface ContentCalendarTemplate {
  id?: string;
  name: string;
  description?: string;
  prompt: string;
  fields: TemplateField[];
  outputFields: OutputField[];
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutputField {
  id: string;
  name: string;
  label: string;
  description?: string;
  type: 'text' | 'array' | 'textarea';
}

export interface AnalysisResult {
  id: string;
  templateId: string;
  rowIndex: number;
  prompt: string;
  response: string;
  parsedResponse?: Record<string, any>;
  createdAt: string;
}

export interface ContentCalendarRow {
  [key: string]: string;
} 