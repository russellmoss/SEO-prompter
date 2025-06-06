import { TemplateMapping, ExcelRow } from './types';

export function processTemplate(template: TemplateMapping, excelRow: ExcelRow): string {
  let content = template.content;

  // Replace all field placeholders with their corresponding values
  template.fields.forEach((field) => {
    const placeholder = `[${field.id.toUpperCase()}]`;
    let value = '';

    if (field.excelColumn && excelRow[field.excelColumn]) {
      value = excelRow[field.excelColumn];
    } else if (field.defaultValue) {
      // Handle both string and string array default values
      if (Array.isArray(field.defaultValue)) {
        value = field.defaultValue.join(', ');
      } else {
        value = field.defaultValue;
      }
    }

    // Handle different field types
    switch (field.type) {
      case 'array':
        // Split comma-separated values and format as list items
        const items = value.split(',').map((item) => item.trim());
        value = items.map((item) => `<li>${item}</li>`).join('\n');
        break;
      case 'html':
        // Use the value as-is for HTML content
        break;
      case 'image':
        // Format as an image tag with appropriate classes
        value = `<img src="${value}" alt="${field.label}" class="image-${field.id}" />`;
        break;
      default:
        // For text and textarea, just use the value as-is
        break;
    }

    // Replace all instances of the placeholder with the value
    content = content.replace(new RegExp(placeholder, 'g'), value);
  });

  return content;
}

export function validateTemplateData(template: TemplateMapping, excelRow: ExcelRow): string[] {
  const errors: string[] = [];

  // Check required fields
  template.fields.forEach((field) => {
    if (field.required) {
      if (!field.excelColumn || !excelRow[field.excelColumn]) {
        errors.push(`Missing required field: ${field.label}`);
      }
    }
  });

  // Validate field values based on validation rules
  template.fields.forEach((field) => {
    if (field.excelColumn && excelRow[field.excelColumn]) {
      const value = excelRow[field.excelColumn];

      if (field.validation) {
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors.push(`Invalid format for ${field.label}`);
        }
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors.push(`${field.label} is too short (minimum ${field.validation.minLength} characters)`);
        }
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors.push(`${field.label} is too long (maximum ${field.validation.maxLength} characters)`);
        }
      }
    }
  });

  return errors;
}

export function getTemplatePreview(template: TemplateMapping): string {
  let preview = template.content;

  // Replace all field placeholders with example values
  template.fields.forEach((field) => {
    const placeholder = `[${field.id.toUpperCase()}]`;
    let exampleValue = '';

    switch (field.type) {
      case 'text':
        exampleValue = `Example ${field.label}`;
        break;
      case 'textarea':
        exampleValue = `Example ${field.label}\nWith multiple lines\nof text`;
        break;
      case 'array':
        exampleValue = '<li>Example Item 1</li>\n<li>Example Item 2</li>';
        break;
      case 'html':
        exampleValue = `<div>Example ${field.label} HTML</div>`;
        break;
      case 'image':
        exampleValue = `<img src="example.jpg" alt="${field.label}" class="image-${field.id}" />`;
        break;
    }

    preview = preview.replace(new RegExp(placeholder, 'g'), exampleValue);
  });

  return preview;
} 