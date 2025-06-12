import { TemplateMapping } from './types';

export const enhancedMileaSEOTemplate: TemplateMapping = {
  id: 'enhanced-milea-seo',
  name: 'Enhanced Milea SEO Blog Template with Holistic Analysis',
  description: 'Advanced SEO template that analyzes the entire content calendar for optimal content creation and internal linking',
  content: `# HOLISTIC CONTENT ANALYSIS & SEMANTIC CLUSTERING REPORT

## CONTENT CALENDAR ANALYSIS
Based on analysis of your ENTIRE content calendar ([TOTAL_POSTS] posts):

### Current Content Distribution
- Total Posts: [TOTAL_POSTS]
- Published Posts: [PUBLISHED_POSTS]
- Pillar Distribution: [PILLAR_DISTRIBUTION]

### Semantic Clustering Analysis
Your content has been analyzed for semantic relationships and grouped into [CLUSTER_COUNT] clusters:

[CLUSTER_ANALYSIS]

### Internal Link Opportunities
Based on semantic analysis, we've identified [LINK_OPPORTUNITIES_COUNT] internal linking opportunities:

[LINK_OPPORTUNITIES]

## CONTENT CREATION GUIDELINES

### 1. SEMANTIC UNIQUENESS REQUIREMENTS
Based on analysis of similar content in your calendar:

**Similar Posts to Differentiate From:**
[SIMILAR_POSTS_ANALYSIS]

**Required Differentiation Points:**
1. Avoid overlapping with: [SIMILAR_POSTS_TITLES]
2. Focus on unique aspects not covered in existing content
3. Target semantic gaps identified in content analysis
4. Ensure pillar balance based on current distribution

### 2. INTERNAL LINK CLUSTERING STRATEGY
Based on semantic analysis of your content calendar:

**Primary MILEA ESTATE LINKS (Choose 2-3 most relevant):**
- Homepage: https://mileaestatevineyard.com (Use for: brand mentions, general winery references)
- Vineyard Practices: https://mileaestatevineyard.com/vineyard/ (Use for: terroir, sustainability, viticulture content)
- Wine Club: https://mileaestatevineyard.com/wine-club/ (Use for: wine education, exclusive access content)
- Shop: https://mileaestatevineyard.com/shop/ (Use for: wine recommendations, purchasing calls-to-action)
- Visit Information: https://mileaestatevineyard.com/visit/ (Use for: tasting experiences, planning visits)
- Weddings: https://mileaestatevineyard.com/weddings/ (Use for: event content, venue features)
- Events: https://mileaestatevineyard.com/events/ (Use for: special occasions, seasonal content)
- Russell Moss Bio: https://mileaestatevineyard.com/people/russell-moss/ (Use for: expertise, winemaking insights)

**SEMANTICALLY RELEVANT INTERNAL LINKS:**
Based on content clustering analysis, include these links:
[INTERNAL_LINK_SUGGESTIONS]

### 3. CONTENT REQUIREMENTS

**Title: [TITLE]**
- Must be semantically unique from similar posts
- Should target identified content gaps
- Must align with pillar strategy

**Keywords: [KEYWORDS]**
- Primary: [PRIMARY_KEYWORD]
- Secondary: [SECONDARY_KEYWORDS]
- Semantic variations: [SEMANTIC_VARIATIONS]

**Content Structure:**
1. Introduction
   - Address identified content gaps
   - Differentiate from similar posts
   - Establish unique value proposition

2. Main Content
   - Include semantic variations of target keywords
   - Reference related content clusters
   - Incorporate internal link suggestions
   - Address content gaps in pillar

3. Conclusion
   - Reinforce unique positioning
   - Include strategic internal links
   - Clear call-to-action

### 4. PHOTO SEO OPTIMIZATION

Generate SEO-optimized details for these photos:
[PHOTO_1]: 
[PHOTO_2]:
[PHOTO_3]: 
[PHOTO_4]:
[PHOTO_5]:

For each photo, provide:
- Optimal filename (format: descriptive-keywords-milea-estate.jpg)
- Alt text (descriptive, keyword-rich, under 125 characters)
- Meta title for WordPress
- Meta description for WordPress
- Placement suggestion within the post

### 5. SEMANTIC CLUSTERING REQUIREMENTS

Based on content calendar analysis, this post should:
1. Join or create a content cluster around: [CLUSTER_THEME]
2. Link to these related posts: [RELATED_POSTS]
3. Use these semantic variations: [SEMANTIC_VARIATIONS]
4. Target these content gaps: [CONTENT_GAPS]

### 6. FINAL PROMPT FOR CLAUDE

Create a comprehensive blog post that:
1. Is semantically unique from existing content
2. Fills identified content gaps
3. Strengthens content clusters
4. Implements strategic internal linking
5. Optimizes for target keywords
6. Includes all required photos with SEO optimization
7. Maintains pillar balance
8. Provides unique value not found in similar posts

The content should be:
- 1500-2000 words
- Include 2-3 strategic internal links
- Optimize 5 photos with SEO metadata
- Target identified content gaps
- Differentiate from similar posts
- Support pillar strategy
- Include semantic variations of keywords`,

  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'Blog Title',
      type: 'text',
      placeholder: 'Enter the blog post title',
      excelColumn: 'B',
      required: true,
      description: 'The main title of the blog post',
      isManualEntry: false
    },
    {
      id: 'pillar',
      name: 'pillar',
      label: 'Content Pillar',
      type: 'text',
      placeholder: 'Enter the content pillar',
      excelColumn: 'D',
      required: true,
      description: 'The content pillar this post supports',
      isManualEntry: false
    },
    {
      id: 'keywords',
      name: 'keywords',
      label: 'Target Keywords',
      type: 'text',
      placeholder: 'Enter target keywords',
      excelColumn: 'C',
      required: true,
      description: 'Main keywords to target in the blog post',
      isManualEntry: false
    },
    {
      id: 'cta',
      name: 'cta',
      label: 'Call to Action Focus',
      type: 'text',
      placeholder: 'Enter CTA focus',
      excelColumn: 'E',
      required: true,
      description: 'Primary call-to-action for the post',
      isManualEntry: false
    },
    {
      id: 'content_requirements',
      name: 'content_requirements',
      label: 'Content Requirements',
      type: 'textarea',
      placeholder: 'Enter specific content requirements',
      excelColumn: 'F',
      required: false,
      description: 'Specific requirements for the content',
      isManualEntry: false
    },
    {
      id: 'photo_1',
      name: 'photo_1',
      label: 'Photo 1 Description',
      type: 'text',
      placeholder: 'Describe photo 1',
      excelColumn: 'G',
      required: false,
      description: 'Description of the first photo',
      isManualEntry: false
    },
    {
      id: 'photo_2',
      name: 'photo_2',
      label: 'Photo 2 Description',
      type: 'text',
      placeholder: 'Describe photo 2',
      excelColumn: 'H',
      required: false,
      description: 'Description of the second photo',
      isManualEntry: false
    },
    {
      id: 'photo_3',
      name: 'photo_3',
      label: 'Photo 3 Description',
      type: 'text',
      placeholder: 'Describe photo 3',
      excelColumn: 'I',
      required: false,
      description: 'Description of the third photo',
      isManualEntry: false
    },
    {
      id: 'photo_4',
      name: 'photo_4',
      label: 'Photo 4 Description',
      type: 'text',
      placeholder: 'Describe photo 4',
      excelColumn: 'J',
      required: false,
      description: 'Description of the fourth photo',
      isManualEntry: false
    },
    {
      id: 'photo_5',
      name: 'photo_5',
      label: 'Photo 5 Description',
      type: 'text',
      placeholder: 'Describe photo 5',
      excelColumn: 'K',
      required: false,
      description: 'Description of the fifth photo',
      isManualEntry: false
    },
    // Dynamic fields populated by holistic analysis
    {
      id: 'total_posts',
      name: 'total_posts',
      label: 'Total Posts in Calendar',
      type: 'text',
      placeholder: 'Auto-populated from analysis',
      required: false,
      description: 'Total number of posts in the content calendar',
      isManualEntry: true
    },
    {
      id: 'published_posts',
      name: 'published_posts',
      label: 'Published Posts Count',
      type: 'text',
      placeholder: 'Auto-populated from analysis',
      required: false,
      description: 'Number of already published posts',
      isManualEntry: true
    },
    {
      id: 'pillar_distribution',
      name: 'pillar_distribution',
      label: 'Pillar Distribution',
      type: 'textarea',
      placeholder: 'Auto-populated from analysis',
      required: false,
      description: 'Distribution of posts across content pillars',
      isManualEntry: true
    },
    {
      id: 'similar_posts_analysis',
      name: 'similar_posts_analysis',
      label: 'Similar Posts Analysis',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Analysis of semantically similar posts in the calendar',
      isManualEntry: true
    },
    {
      id: 'published_content_descriptions',
      name: 'published_content_descriptions',
      label: 'Published Content Descriptions',
      type: 'textarea',
      placeholder: 'Auto-populated from published posts',
      required: false,
      description: 'Descriptions of already published content',
      isManualEntry: true
    },
    {
      id: 'published_posts_urls',
      name: 'published_posts_urls',
      label: 'Published Posts URLs',
      type: 'textarea',
      placeholder: 'Auto-populated from published posts',
      required: false,
      description: 'URLs of published posts for internal linking',
      isManualEntry: true
    },
    {
      id: 'similar_posts_titles',
      name: 'similar_posts_titles',
      label: 'Similar Posts Titles',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Titles of similar posts to differentiate from',
      isManualEntry: true
    },
    {
      id: 'cluster_analysis',
      name: 'cluster_analysis',
      label: 'Cluster Analysis',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Detailed analysis of content clusters',
      isManualEntry: true
    },
    {
      id: 'link_opportunities',
      name: 'link_opportunities',
      label: 'Link Opportunities',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Internal link opportunities based on semantic analysis',
      isManualEntry: true
    },
    {
      id: 'internal_link_suggestions',
      name: 'internal_link_suggestions',
      label: 'Internal Link Suggestions',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Semantically relevant internal link suggestions',
      isManualEntry: true
    },
    {
      id: 'cluster_theme',
      name: 'cluster_theme',
      label: 'Cluster Theme',
      type: 'text',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Theme of the content cluster this post should join',
      isManualEntry: true
    },
    {
      id: 'related_posts',
      name: 'related_posts',
      label: 'Related Posts',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Posts related to this content cluster',
      isManualEntry: true
    },
    {
      id: 'semantic_variations',
      name: 'semantic_variations',
      label: 'Semantic Variations',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Semantic variations of target keywords',
      isManualEntry: true
    },
    {
      id: 'content_gaps',
      name: 'content_gaps',
      label: 'Content Gaps',
      type: 'textarea',
      placeholder: 'Auto-populated from semantic analysis',
      required: false,
      description: 'Content gaps identified in the analysis',
      isManualEntry: true
    }
  ],
  version: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}; 