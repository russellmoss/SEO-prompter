import * as XLSX from 'xlsx';
import { EnhancedExcelRow, SemanticAnalysis, ContentAnalysis, InternalLinkSuggestion } from './types';

export class EnhancedExcelParser {
  static async parseFileWithAnalysis(file: File): Promise<{
    data: EnhancedExcelRow[];
    fullAnalysis: ContentAnalysisResult;
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      if (!firstSheet) {
        throw new Error('No sheets found in the Excel file');
      }

      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      if (!data || data.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }

      const headers = data[0] as string[];
      const rows = data.slice(1).map((row: any) => {
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          const columnLetter = this.getColumnLetter(index);
          const value = row[index];
          rowData[columnLetter] = value ? String(value) : '';
        });
        return rowData as EnhancedExcelRow;
      });

      const fullAnalysis = this.analyzeContentHolistically(rows);

      return { data: rows, fullAnalysis };
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw error;
    }
  }

  private static analyzeContentHolistically(rows: EnhancedExcelRow[]): ContentAnalysisResult {
    return {
      totalPosts: rows.length,
      publishedPosts: rows.filter(row => row.published_url).length,
      pillarDistribution: this.analyzePillarDistribution(rows),
      semanticClusters: this.identifySemanticClusters(rows),
      internalLinkOpportunities: this.identifyInternalLinkOpportunities(rows),
      contentGaps: this.identifyContentGaps(rows)
    };
  }

  private static analyzePillarDistribution(rows: EnhancedExcelRow[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    rows.forEach(row => {
      const pillar = row.D || 'Unknown'; // Assuming column D is pillar
      distribution[pillar] = (distribution[pillar] || 0) + 1;
    });
    return distribution;
  }

  private static identifySemanticClusters(rows: EnhancedExcelRow[]): SemanticCluster[] {
    const clusters: SemanticCluster[] = [];
    const processed = new Set<number>();

    rows.forEach((row, index) => {
      if (processed.has(index)) return;

      const title = row.B || ''; // Assuming column B is title
      const keywords = row.C || ''; // Assuming column C is keywords
      const pillar = row.D || '';

      const similarPosts = rows
        .map((otherRow, otherIndex) => {
          if (index === otherIndex || processed.has(otherIndex)) return null;
          
          const similarity = this.calculateSimilarity(
            { title, keywords, pillar },
            { 
              title: otherRow.B || '', 
              keywords: otherRow.C || '', 
              pillar: otherRow.D || '' 
            }
          );

          return similarity > 0.3 ? { index: otherIndex, similarity, row: otherRow } : null;
        })
        .filter((post): post is { index: number; similarity: number; row: EnhancedExcelRow } => post !== null);

      if (similarPosts.length > 0) {
        const cluster: SemanticCluster = {
          id: `cluster-${clusters.length}`,
          mainPost: { index, row },
          relatedPosts: similarPosts,
          theme: this.extractTheme(title, keywords),
          internalLinkOpportunities: similarPosts.map(post => ({
            fromIndex: index,
            toIndex: post.index,
            suggestedAnchor: this.generateAnchorText(post.row.B || ''),
            relevance: post.similarity
          }))
        };

        clusters.push(cluster);
        processed.add(index);
        similarPosts.forEach(post => processed.add(post.index));
      }
    });

    return clusters;
  }

  private static calculateSimilarity(post1: any, post2: any): number {
    // Simple similarity calculation based on shared keywords and pillar
    const keywords1 = post1.keywords.toLowerCase().split(',').map((k: string) => k.trim());
    const keywords2 = post2.keywords.toLowerCase().split(',').map((k: string) => k.trim());
    
    const sharedKeywords = keywords1.filter((k: string) => keywords2.includes(k));
    const keywordSimilarity = sharedKeywords.length / Math.max(keywords1.length, keywords2.length);
    
    const pillarMatch = post1.pillar === post2.pillar ? 0.3 : 0;
    const titleSimilarity = this.calculateTextSimilarity(post1.title, post2.title) * 0.4;
    
    return Math.min(keywordSimilarity * 0.5 + pillarMatch + titleSimilarity, 1);
  }

  private static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    const sharedWords = words1.filter(word => words2.includes(word));
    return sharedWords.length / Math.max(words1.length, words2.length);
  }

  private static extractTheme(title: string, keywords: string): string {
    const allWords = `${title} ${keywords}`.toLowerCase();
    const commonThemes = ['wine tasting', 'wedding', 'vineyard', 'events', 'sustainability', 'harvest'];
    return commonThemes.find(theme => allWords.includes(theme)) || 'General';
  }

  private static generateAnchorText(title: string): string {
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }

  private static identifyInternalLinkOpportunities(rows: EnhancedExcelRow[]): InternalLinkOpportunity[] {
    // Analyze published posts and suggest internal links based on content clustering
    return rows
      .filter(row => row.published_url)
      .map((row, index) => ({
        postIndex: index,
        title: row.B || '',
        url: row.published_url || '',
        suggestedLinks: this.findRelatedPublishedPosts(row, rows)
      }));
  }

  private static findRelatedPublishedPosts(currentRow: EnhancedExcelRow, allRows: EnhancedExcelRow[]): string[] {
    return allRows
      .filter(row => row.published_url && row !== currentRow)
      .filter(row => {
        const similarity = this.calculateSimilarity(
          { title: currentRow.B, keywords: currentRow.C, pillar: currentRow.D },
          { title: row.B, keywords: row.C, pillar: row.D }
        );
        return similarity > 0.2;
      })
      .slice(0, 3)
      .map(row => row.published_url || '');
  }

  private static identifyContentGaps(rows: EnhancedExcelRow[]): ContentGap[] {
    const pillarCounts = this.analyzePillarDistribution(rows);
    const totalPosts = rows.length;
    
    return Object.entries(pillarCounts)
      .map(([pillar, count]) => ({
        pillar,
        currentCount: count,
        suggestedCount: Math.ceil(totalPosts * 0.2), // Suggest 20% per major pillar
        gap: Math.max(0, Math.ceil(totalPosts * 0.2) - count)
      }))
      .filter(gap => gap.gap > 0);
  }

  private static getColumnLetter(columnNumber: number): string {
    let columnLetter = '';
    while (columnNumber >= 0) {
      columnLetter = String.fromCharCode(65 + (columnNumber % 26)) + columnLetter;
      columnNumber = Math.floor(columnNumber / 26) - 1;
    }
    return columnLetter;
  }
}

// Supporting interfaces
interface ContentAnalysisResult {
  totalPosts: number;
  publishedPosts: number;
  pillarDistribution: Record<string, number>;
  semanticClusters: SemanticCluster[];
  internalLinkOpportunities: InternalLinkOpportunity[];
  contentGaps: ContentGap[];
}

interface SemanticCluster {
  id: string;
  mainPost: { index: number; row: EnhancedExcelRow };
  relatedPosts: Array<{ index: number; similarity: number; row: EnhancedExcelRow }>;
  theme: string;
  internalLinkOpportunities: Array<{
    fromIndex: number;
    toIndex: number;
    suggestedAnchor: string;
    relevance: number;
  }>;
}

interface InternalLinkOpportunity {
  postIndex: number;
  title: string;
  url: string;
  suggestedLinks: string[];
}

interface ContentGap {
  pillar: string;
  currentCount: number;
  suggestedCount: number;
  gap: number;
} 