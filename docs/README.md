# Excel Prompt Generator Documentation

## Overview
The Excel Prompt Generator is a specialized web application designed to streamline the creation of SEO-rich blog content for Milea Estate Vineyard. The application facilitates a structured approach to content generation by combining AI-generated prompts with specific vineyard data to create authentic, knowledgeable blog posts.

## Purpose
The primary goal of this application is to:
1. Generate structured prompts for blog content
2. Combine AI-generated content with real vineyard data
3. Create SEO-optimized blog posts that maintain authenticity and accuracy
4. Ensure content reflects actual vineyard knowledge rather than AI hallucinations

## Workflow

### 1. Initial Prompt Generation
- Use Claude to generate the initial content structure
- Define the main topics and themes for the blog post
- Establish the SEO keywords and focus areas

### 2. Excel Data Preparation
- Create an Excel document with structured fields
- Use Claude and ChatGPT to populate field content
- Fields typically include:
  - Main topic
  - Subtopics
  - Key points
  - SEO keywords
  - Target audience
  - Content tone
  - Specific vineyard details

### 3. Application Usage

#### Template Management
- Create and manage templates for different types of blog posts
- Templates define the structure and required fields
- Each template can be customized for specific content types

#### Prompt Generation
1. Upload the prepared Excel file
2. Select the appropriate template
3. The application combines:
   - Template structure
   - Excel data
   - Predefined prompts
4. Generate the final prompt

#### Saved Prompts
- Save generated prompts for future use
- Organize prompts in folders
- Edit and update existing prompts
- Copy prompts for use in Claude

### 4. Final Content Generation
- Use the generated prompt in a Claude instance
- The Claude instance should be:
  - Pre-loaded with Milea Estate Vineyard knowledge
  - Configured with specific SEO guidelines
  - Trained on authentic vineyard data
- Generate the final blog post

## Technical Architecture

### Frontend
- Built with Next.js 14 and React 18
- Uses TypeScript for type safety
- Implements a responsive design with Tailwind CSS
- Features:
  - Excel file upload and parsing using SheetJS
  - Template management with real-time updates
  - Prompt generation with dynamic field mapping
  - Saved prompts organization with folder structure

### Backend
- Supabase for database management
- Stores:
  - Templates
  - Saved prompts
  - User preferences
- Database Schema:
  ```sql
  -- Templates table
  create table templates (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    fields jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Saved prompts table
  create table saved_prompts (
    id uuid default uuid_generate_v4() primary key,
    template_id uuid references templates(id),
    folder_name text not null,
    prompt_name text not null,
    prompt_content text not null,
    row_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```

### Key Components

#### Excel Parser
- Handles Excel file uploads using SheetJS
- Parses structured data with type validation
- Validates field content against template requirements
- Example Excel Structure:
  ```
  | Topic | Subtopic | Key Points | SEO Keywords | Target Audience | Content Tone | Vineyard Details |
  |-------|----------|------------|--------------|-----------------|--------------|------------------|
  | Wine Making Process | Fermentation | - Temperature control\n- Yeast selection\n- Duration | wine making, fermentation, temperature control | Wine enthusiasts, Industry professionals | Technical, Educational | Our 72-hour cold soak process... |
  | Wine Tasting | Red Wines | - Aroma profiles\n- Tannin levels\n- Food pairing | wine tasting, red wine, food pairing | General audience, Wine lovers | Conversational, Engaging | Our estate-grown Cabernet Sauvignon... |
  ```

#### Template Manager
- Manages content templates with TypeScript interfaces
- Defines field structures with validation rules
- Handles template CRUD operations
- Example Template Structure:
  ```typescript
  interface TemplateField {
    id: string;
    name: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect';
    required: boolean;
    options?: string[];
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  }

  interface Template {
    id: string;
    name: string;
    description: string;
    fields: TemplateField[];
  }
  ```

#### Prompt Generator
- Combines template and Excel data using field mapping
- Generates structured prompts with dynamic content
- Manages prompt variations based on template type
- Example Prompt Generation:
  ```typescript
  interface PromptData {
    templateId: string;
    rowIndex: number;
    fieldValues: Record<string, string>;
  }

  function generatePrompt(data: PromptData): string {
    const template = getTemplate(data.templateId);
    const prompt = template.fields.map(field => {
      const value = data.fieldValues[field.id];
      return `${field.name}: ${value}`;
    }).join('\n\n');
    
    return `Create a blog post with the following specifications:\n\n${prompt}`;
  }
  ```

#### Saved Prompts Manager
- Organizes prompts in folders with hierarchical structure
- Handles prompt CRUD operations with optimistic updates
- Provides prompt editing capabilities with version history
- Example Folder Structure:
  ```
  /Wine Making
    /Process
      - Fermentation Techniques
      - Aging Process
    /Equipment
      - Press Types
      - Storage Systems
  /Wine Tasting
    /Red Wines
      - Cabernet Sauvignon
      - Pinot Noir
    /White Wines
      - Chardonnay
      - Sauvignon Blanc
  ```

### State Management
- Uses React Context for global state
- Implements custom hooks for data fetching
- Manages local state with useState and useReducer
- Example State Structure:
  ```typescript
  interface AppState {
    templates: Template[];
    activeTemplate: Template | null;
    excelData: ExcelRow[];
    savedPrompts: SavedPrompt[];
    selectedFolder: string;
    loading: boolean;
    error: string | null;
  }
  ```

### API Integration
- RESTful endpoints for CRUD operations
- Real-time updates using Supabase subscriptions
- Error handling and retry logic
- Example API Structure:
  ```typescript
  const api = {
    templates: {
      getAll: () => supabase.from('templates').select('*'),
      create: (template: Template) => supabase.from('templates').insert(template),
      update: (id: string, template: Template) => supabase.from('templates').update(template).eq('id', id),
      delete: (id: string) => supabase.from('templates').delete().eq('id', id)
    },
    prompts: {
      getByFolder: (folder: string) => supabase.from('saved_prompts').select('*').eq('folder_name', folder),
      save: (prompt: SavedPrompt) => supabase.from('saved_prompts').insert(prompt),
      update: (id: string, prompt: SavedPrompt) => supabase.from('saved_prompts').update(prompt).eq('id', id),
      delete: (id: string) => supabase.from('saved_prompts').delete().eq('id', id)
    }
  };
  ```

## Best Practices

### Content Generation
1. Always verify AI-generated content against real vineyard data
2. Maintain consistency in terminology and branding
3. Ensure SEO optimization while preserving authenticity
4. Use specific vineyard details to enhance credibility

### Template Usage
1. Create templates for different content types
2. Include all necessary fields for comprehensive content
3. Maintain consistent structure across similar content types
4. Update templates based on content performance

### Prompt Management
1. Organize prompts in logical folder structures
2. Use descriptive names for easy identification
3. Regularly review and update saved prompts
4. Maintain version control for important prompts

## Security Considerations
- Secure file upload handling
- Data validation and sanitization
- Protected API endpoints
- Secure storage of sensitive information

## Future Enhancements
1. Integration with content management systems
2. Advanced SEO analysis tools
3. Content performance tracking
4. Automated content scheduling
5. Enhanced template customization options

## Getting Started

### Prerequisites
- Node.js and npm
- Supabase account
- Excel file with structured data
- Claude API access

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start the development server: `npm run dev`

### Configuration
1. Set up Supabase connection
2. Configure API keys
3. Set up template structures
4. Prepare Excel data format

## Support
For technical support or questions about the application, please contact the development team.

## Contributing
Guidelines for contributing to the project:
1. Follow the established code style
2. Write comprehensive tests
3. Document new features
4. Submit pull requests with detailed descriptions 