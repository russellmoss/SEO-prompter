import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeResponse {
  content: string;
  error?: string;
}

export const claudeService = {
  async generateContent(prompt: string): Promise<ClaudeResponse> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return { content: content.text };
      }
      
      return { 
        content: '',
        error: 'Unexpected response format' 
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return { 
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate content'
      };
    }
  }
}; 