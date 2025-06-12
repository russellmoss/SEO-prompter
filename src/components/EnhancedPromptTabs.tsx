'use client';

import { useState, useEffect, useRef } from 'react';
import { Maximize2, X, Copy, Save, BarChart3, Link, AlertTriangle } from 'lucide-react';
import { EnhancedExcelRow, TemplateMapping, TemplateField, SavedPrompt } from '@/lib/types';
import { savedPromptService } from '@/lib/savedPromptService';
import { EnhancedExcelParser } from '@/lib/enhancedExcelParser';

interface EnhancedPromptTabsProps {
  data: EnhancedExcelRow[];
  template: TemplateMapping | null;
  fullAnalysis: any; // ContentAnalysisResult from enhanced parser
  initialSavedPrompt?: SavedPrompt;
}

export default function EnhancedPromptTabs({ 
  data, 
  template, 
  fullAnalysis,
  initialSavedPrompt 
}: EnhancedPromptTabsProps) {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [expandedField, setExpandedField] = useState<TemplateField | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [semanticWarnings, setSemanticWarnings] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (template && data[activePromptIndex]) {
      const newFieldValues: Record<string, string> = {};
      
      // Populate regular fields from Excel data
      template.fields.forEach(field => {
        if (!field.isManualEntry && field.excelColumn) {
          const excelValue = data[activePromptIndex][field.excelColumn];
          if (excelValue !== undefined && excelValue !== null) {
            newFieldValues[field.id] = field.type === 'array' 
              ? Array.isArray(excelValue) ? excelValue.join(', ') : String(excelValue)
              : String(excelValue);
          }
        }
      });

      // Auto-populate analysis fields
      if (fullAnalysis) {
        newFieldValues['total_posts'] = fullAnalysis.totalPosts.toString();
        newFieldValues['published_posts'] = fullAnalysis.publishedPosts.toString();
        newFieldValues['pillar_distribution'] = JSON.stringify(fullAnalysis.pillarDistribution, null, 2);
        
        // Find similar posts for current post
        const currentPost = data[activePromptIndex];
        const similarPosts = findSimilarPosts(currentPost, data, activePromptIndex);
        newFieldValues['similar_posts_analysis'] = formatSimilarPostsAnalysis(similarPosts);
        newFieldValues['similar_posts_titles'] = similarPosts.map(p => p.title).join('\n');
        
        // Get published content descriptions
        const publishedContent = data.filter(row => row.published_url);
        newFieldValues['published_content_descriptions'] = publishedContent
          .map(row => `${row.B}: ${row.content_description || 'No description available'}`)
          .join('\n\n');
        
        newFieldValues['published_posts_urls'] = publishedContent
          .map(row => row.published_url)
          .filter(Boolean)
          .join('\n');

        // Check for semantic warnings
        checkSemanticSimilarity(currentPost, similarPosts);
      }

      setFieldValues(newFieldValues);
    }
  }, [template, data, activePromptIndex, fullAnalysis]);

  const findSimilarPosts = (currentPost: EnhancedExcelRow, allData: EnhancedExcelRow[], currentIndex: number) => {
    const currentTitle = currentPost.B || '';
    const currentKeywords = currentPost.C || '';
    const currentPillar = currentPost.D || '';

    return allData
      .map((row, index) => {
        if (index === currentIndex) return null;
        
        const similarity = calculateSimilarity(
          { title: currentTitle, keywords: currentKeywords, pillar: currentPillar },
          { title: row.B || '', keywords: row.C || '', pillar: row.D || '' }
        );

        return similarity > 0.3 ? {
          index,
          title: row.B || '',
          similarity,
          pillar: row.D || '',
          isPublished: !!row.published_url,
          url: row.published_url
        } : null;
      })
      .filter((post): post is NonNullable<typeof post> => post !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  };

  const calculateSimilarity = (post1: any, post2: any): number => {
    const keywords1 = post1.keywords.toLowerCase().split(',').map((k: string) => k.trim());
    const keywords2 = post2.keywords.toLowerCase().split(',').map((k: string) => k.trim());
    
    const sharedKeywords = keywords1.filter((k: string) => keywords2.includes(k));
    const keywordSimilarity = sharedKeywords.length / Math.max(keywords1.length, keywords2.length);
    
    const pillarMatch = post1.pillar === post2.pillar ? 0.3 : 0;
    const titleSimilarity = calculateTextSimilarity(post1.title, post2.title) * 0.4;
    
    return Math.min(keywordSimilarity * 0.5 + pillarMatch + titleSimilarity, 1);
  };

  const calculateTextSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    const sharedWords = words1.filter(word => words2.includes(word));
    return sharedWords.length / Math.max(words1.length, words2.length);
  };

  const formatSimilarPostsAnalysis = (similarPosts: any[]) => {
    if (similarPosts.length === 0) {
      return "No semantically similar posts found. This post appears to be unique in your content calendar.";
    }

    return similarPosts.map(post => 
      `- "${post.title}" (${Math.round(post.similarity * 100)}% similar, ${post.pillar} pillar)${post.isPublished ? ' [PUBLISHED]' : ' [PLANNED]'}`
    ).join('\n');
  };

  const checkSemanticSimilarity = (currentPost: EnhancedExcelRow, similarPosts: any[]) => {
    const warnings: string[] = [];
    
    const highSimilarity = similarPosts.filter(p => p.similarity > 0.7);
    if (highSimilarity.length > 0) {
      warnings.push(`High semantic similarity detected with ${highSimilarity.length} post(s). Consider differentiating approach.`);
    }

    const publishedSimilar = similarPosts.filter(p => p.isPublished && p.similarity > 0.5);
    if (publishedSimilar.length > 0) {
      warnings.push(`Similar published content exists. Ensure unique angle to avoid content cannibalization.`);
    }

    setSemanticWarnings(warnings);
  };

  const generatePrompt = () => {
    if (!template) return '';
    let prompt = template.content;
    
    template.fields.forEach(field => {
      const value = fieldValues[field.id] || '';
      const placeholder = `[${field.id.toUpperCase()}]`;
      prompt = prompt.replaceAll(placeholder, value);
    });
    
    return prompt;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatePrompt());
      // Add success feedback
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!template) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Select a template to start generating prompts</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available. Please upload an Excel file.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Analysis Toggle */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
            {template.description && (
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              {showAnalysis ? 'Hide' : 'Show'} Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Semantic Warnings */}
      {semanticWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Semantic Similarity Warnings</h3>
              <ul className="mt-1 text-sm text-yellow-700">
                {semanticWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Content Analysis Panel */}
      {showAnalysis && fullAnalysis && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Content Calendar Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Content Overview</h4>
              <p className="text-2xl font-bold text-blue-700">{fullAnalysis.totalPosts}</p>
              <p className="text-sm text-blue-600">Total Posts</p>
              <p className="text-lg font-semibold text-blue-700">{fullAnalysis.publishedPosts}</p>
              <p className="text-sm text-blue-600">Published</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Pillar Distribution</h4>
              {Object.entries(fullAnalysis.pillarDistribution as Record<string, number> || {}).map(([pillar, count]) => (
                <div key={pillar} className="flex justify-between">
                  <span className="text-sm text-green-700">{pillar}:</span>
                  <span className="text-sm font-semibold text-green-800">{count}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900">Clustering Opportunities</h4>
              <p className="text-2xl font-bold text-purple-700">
                {fullAnalysis.semanticClusters?.length || 0}
              </p>
              <p className="text-sm text-purple-600">Content Clusters</p>
              <p className="text-lg font-semibold text-purple-700">
                {fullAnalysis.internalLinkOpportunities?.length || 0}
              </p>
              <p className="text-sm text-purple-600">Link Opportunities</p>
            </div>
          </div>

          {/* Similar Content Analysis */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Similar Content Analysis</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                {fullAnalysis.semanticClusters?.map((cluster: any) => (
                  <div key={cluster.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <h5 className="font-medium text-gray-800">Theme: {cluster.theme}</h5>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-600">Main Post: {cluster.mainPost.row.B}</p>
                      <div className="text-sm text-gray-600">
                        Related Posts:
                        <ul className="list-disc list-inside mt-1">
                          {cluster.relatedPosts.map((post: any) => (
                            <li key={post.index}>
                              {post.row.B} ({Math.round(post.similarity * 100)}% similar)
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Internal Link Opportunities */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Internal Link Opportunities</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                {fullAnalysis.internalLinkOpportunities?.map((opportunity: any) => (
                  <div key={opportunity.postIndex} className="border-b border-gray-200 pb-4 last:border-0">
                    <h5 className="font-medium text-gray-800">{opportunity.title}</h5>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Suggested Links:</p>
                      <ul className="list-disc list-inside mt-1">
                        {opportunity.suggestedLinks.map((link: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600">{link}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setActivePromptIndex(prev => Math.max(0, prev - 1))}
          disabled={activePromptIndex === 0}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous Post
        </button>
        <span className="text-sm text-gray-500">
          Post {activePromptIndex + 1} of {data.length}
        </span>
        <button
          onClick={() => setActivePromptIndex(prev => Math.min(data.length - 1, prev + 1))}
          disabled={activePromptIndex === data.length - 1}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Post
        </button>
      </div>

      {/* Enhanced Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {template.fields
          .filter(field => !field.isManualEntry || fieldValues[field.id]) // Show manual entry fields only if they have values
          .map((field) => (
          <div key={field.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {!field.isManualEntry && field.excelColumn && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Excel: Column {field.excelColumn})
                    </span>
                  )}
                  {field.isManualEntry && (
                    <span className="text-xs text-blue-500 ml-2">
                      (Auto-Generated)
                    </span>
                  )}
                </label>
                <p className="text-xs text-gray-500">{field.description}</p>
              </div>
              {field.type === 'textarea' && (
                <button
                  onClick={() => setExpandedField(field)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Expand field"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {field.type === 'textarea' ? (
              <textarea
                value={fieldValues[field.id] || ''}
                onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                readOnly={field.isManualEntry}
              />
            ) : (
              <input
                type="text"
                value={fieldValues[field.id] || ''}
                onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                readOnly={field.isManualEntry}
              />
            )}
          </div>
        ))}
      </div>

      {/* Generated Prompt */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Enhanced SEO Prompt with Holistic Analysis</h3>
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Copy className="h-5 w-5" />
            <span>Copy Prompt</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded p-4">
          <pre className="whitespace-pre-wrap text-sm">{generatePrompt()}</pre>
        </div>
      </div>

      {/* Expanded Field Modal */}
      {expandedField && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === modalRef.current) {
              setExpandedField(null);
            }
          }}
          ref={modalRef}
        >
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{expandedField.label}</h3>
              <button
                onClick={() => setExpandedField(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={fieldValues[expandedField.id] || ''}
              onChange={(e) => setFieldValues(prev => ({ ...prev, [expandedField.id]: e.target.value }))}
              placeholder={expandedField.placeholder}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly={expandedField.isManualEntry}
            />
          </div>
        </div>
      )}
    </div>
  );
} 