'use client';

import { useState, useEffect } from 'react';
import { Play, Loader, ChevronLeft, ChevronRight, Save, Copy } from 'lucide-react';
import { ContentCalendarTemplate, ContentCalendarRow } from '@/lib/types';

interface ContentCalendarAnalysisProps {
  template: ContentCalendarTemplate;
  data: ContentCalendarRow[];
}

export default function ContentCalendarAnalysis({ 
  template, 
  data 
}: ContentCalendarAnalysisProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<number, any>>({});
  const [error, setError] = useState<string | null>(null);

  const currentRow = data[currentIndex];

  const generatePrompt = () => {
    let prompt = template.prompt;
    
    // Replace field placeholders with actual values
    template.fields.forEach(field => {
      const value = currentRow[field.excelColumn || ''] || '';
      const placeholder = `{{${field.id}}}`;
      prompt = prompt.replaceAll(placeholder, value);
    });

    // Add instruction for structured output
    prompt += '\n\nPlease provide your response in the following JSON format:\n';
    prompt += JSON.stringify(
      template.outputFields.reduce((acc, field) => {
        acc[field.id] = field.type === 'array' ? ['example1', 'example2'] : 'your response here';
        return acc;
      }, {} as Record<string, any>),
      null,
      2
    );

    return prompt;
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = generatePrompt();
      
      const response = await fetch('/api/claude/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze');
      }

      // Try to parse the response as JSON
      let parsedResult;
      try {
        // Extract JSON from the response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          parsedResult = { raw_response: result.content };
        }
      } catch (e) {
        parsedResult = { raw_response: result.content };
      }

      setResults(prev => ({
        ...prev,
        [currentIndex]: parsedResult
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyResult = (field: string) => {
    const result = results[currentIndex]?.[field];
    if (result) {
      const textToCopy = Array.isArray(result) ? result.join(', ') : result;
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const navigateNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available. Please upload a content calendar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={navigatePrevious}
          disabled={currentIndex === 0}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>
        
        <span className="text-sm text-gray-600">
          Row {currentIndex + 1} of {data.length}
        </span>
        
        <button
          onClick={navigateNext}
          disabled={currentIndex === data.length - 1}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Current Data Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-3">Current Row Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {template.fields.map(field => {
            const value = currentRow[field.excelColumn || ''] || '';
            return (
              <div key={field.id}>
                <span className="text-sm font-medium text-gray-700">{field.label}:</span>
                <p className="text-sm text-gray-900 mt-1">{value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Prompt Preview */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Generated Prompt</h3>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
          {generatePrompt()}
        </pre>
      </div>

      {/* Run Analysis Button */}
      <div className="text-center">
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Run Analysis
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Results Display */}
      {results[currentIndex] && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium mb-4">Analysis Results</h3>
          
          {results[currentIndex].raw_response ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">Raw Response:</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {results[currentIndex].raw_response}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              {template.outputFields.map(field => {
                const value = results[currentIndex][field.id];
                if (!value) return null;

                // Handle different value types
                let displayValue;
                if (typeof value === 'object') {
                  displayValue = JSON.stringify(value, null, 2);
                } else if (Array.isArray(value)) {
                  displayValue = value.join(', ');
                } else {
                  displayValue = String(value);
                }

                return (
                  <div key={field.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{field.label}</h4>
                      <button
                        onClick={() => copyResult(field.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {field.type === 'array' && Array.isArray(value) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {value.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700">
                            {typeof item === 'object' ? JSON.stringify(item) : item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                        {displayValue}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 