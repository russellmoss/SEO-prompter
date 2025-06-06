import { TemplateMapping } from './types';

export const defaultMileaTemplate: TemplateMapping = {
  id: 'milea-blog',
  name: 'Milea Estate Blog Post',
  description: 'Default template for Milea Estate blog posts',
  content: `CORE INSTRUCTIONS
Write a 1,200-word blog post titled: "[TITLE]" for Milea Estate Vineyard, a premier winery and wedding venue in the Hudson Valley of New York.
SEO OPTIMIZATION: Target these keyword phrases: [KEYWORDS]
CONTENT REQUIREMENTS:

[INSERT ANY CONTENT REQUIREMENTS] 

HTML STRUCTURE & STYLING REQUIREMENTS
CRITICAL: All content must be wrapped in a <div class="milea-blog-content"> container with the complete CSS styling provided below. This prevents conflicts with the website header.
Required CSS (Include Exactly As-Is):
<style>
.milea-blog-content {
    font-family: 'Avenir', 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.7;
    color: #4a453b;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.milea-blog-content .blog-title {
    font-family: 'Cochin', 'Times New Roman', serif;
    font-size: 2.5em;
    color: #4a453b;
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 3px solid #a4925a;
    padding-bottom: 20px;
}

.milea-blog-content .blog-h2 {
    font-family: 'Cochin', 'Times New Roman', serif;
    font-size: 2em;
    color: #4a453b;
    margin: 40px 0 20px 0;
    position: relative;
}

.milea-blog-content .blog-h2::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 60px;
    height: 2px;
    background: #a4925a;
}

.milea-blog-content .blog-h3 {
    font-family: 'Cochin', 'Times New Roman', serif;
    font-size: 1.4em;
    color: #6b6b58;
    margin: 30px 0 15px 0;
}

.milea-blog-content .intro-section {
    background: linear-gradient(135deg, #f5f2e8 0%, #e8e4d6 100%);
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 40px;
    border-left: 5px solid #a4925a;
}

.milea-blog-content .content-block {
    margin: 40px 0;
    overflow: hidden;
}

.milea-blog-content .image-left {
    width: 25%;
    float: left;
    margin: 0 25px 15px 0;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(74, 69, 59, 0.15);
    transition: transform 0.3s ease;
}

.milea-blog-content .image-right {
    width: 25%;
    float: right;
    margin: 0 0 15px 25px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(74, 69, 59, 0.15);
    transition: transform 0.3s ease;
}

.milea-blog-content .image-center {
    width: 60%;
    display: block;
    margin: 30px auto;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(74, 69, 59, 0.15);
    transition: transform 0.3s ease;
}

.milea-blog-content .highlight-box {
    background: #a4925a;
    color: white;
    padding: 25px;
    border-radius: 10px;
    margin: 30px 0;
    text-align: center;
    font-weight: bold;
    font-size: 1.1em;
}

.milea-blog-content .highlight-box a {
    color: #f5f2e8;
    text-decoration: underline;
}

.milea-blog-content .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.milea-blog-content .feature-card {
    background: white;
    padding: 25px;
    border-radius: 10px;
    border: 1px solid #e8e4d6;
    box-shadow: 0 4px 12px rgba(74, 69, 59, 0.08);
}

.milea-blog-content .feature-card h4 {
    font-family: 'Cochin', 'Times New Roman', serif;
    color: #a4925a;
    margin-bottom: 15px;
    font-size: 1.2em;
}

.milea-blog-content .stats-section {
    background: linear-gradient(45deg, #4a453b 0%, #6b6b58 100%);
    color: white;
    padding: 40px;
    border-radius: 15px;
    margin: 40px 0;
    text-align: center;
}

.milea-blog-content .faq-section {
    background: #f5f2e8;
    padding: 40px;
    border-radius: 15px;
    margin: 40px 0;
}

.milea-blog-content .cta-section {
    background: linear-gradient(135deg, #a4925a 0%, #8a7d4a 100%);
    color: white;
    padding: 50px;
    border-radius: 20px;
    text-align: center;
    margin: 50px 0;
}

.milea-blog-content .clearfix::after {
    content: "";
    display: table;
    clear: both;
}

.milea-blog-content ul {
    background: white;
    padding: 25px;
    border-radius: 10px;
    border-left: 4px solid #a4925a;
    box-shadow: 0 2px 8px rgba(74, 69, 59, 0.08);
}

.milea-blog-content strong {
    color: #4a453b;
}

.milea-blog-content em {
    color: #a4925a;
    font-style: normal;
    font-weight: bold;
}

.milea-blog-content a {
    color: #a4925a;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-bottom 0.3s ease;
}

.milea-blog-content a:hover {
    border-bottom: 1px solid #a4925a;
}

@media (max-width: 768px) {
    .milea-blog-content .image-left,
    .milea-blog-content .image-right {
        width: 100%;
        float: none;
        margin: 20px 0;
    }
    
    .milea-blog-content .image-center {
        width: 100%;
    }
}
</style>

HTML Structure Requirements:
1. Title: <h1 class="blog-title">[TITLE]</h1>
2. Major Sections: <h2 class="blog-h2">[Section Title]</h2>
3. Subsections: <h3 class="blog-h3">[Subsection Title]</h3>
4. Intro Content: Wrap opening paragraphs in <div class="intro-section">
5. Content Blocks: Use <div class="content-block clearfix"> for sections with images
6. Lists: Style with semantic <ul> and <li> tags
7. Emphasis: Use <strong> for bold, <em> for highlighted text in brand gold

REQUIRED STRUCTURAL ELEMENTS
1. Intro Section
Create an elegant opening in <div class="intro-section"> that introduces the topic and integrates primary keywords naturally.

2. Mid-Post CTA (MANDATORY)
Include this exact code mid-way through the post:
<div class="highlight-box">
    <strong>Want to experience it for yourself?</strong> <a href='https://mileaestatevineyard.com/wine-club/'>Join our wine club</a> or <a href='https://app.perfectvenue.com/venues/milea-estate-vineyard/hello?_gl=1*s6id2k*_gcl_aw*R0NMLjE3NDM1MzMxMzUuQ2owS0NRanduYTZfQmhDYkFSSXNBTElkMlowQ2g3T0FMTllVdzgwM2dHZWVHT3NITkpReXBmMzhBRjZqUC13Y0VULW1mOUZ6M185NHpfa2FBZzFGRUFMd193Y0I.*_gcl_au*MjQwNTIwNjM0LjE3NDkxNDMwMTk.*_ga*MTg3NDU4MzIzMS4xNzQwNTkzMDUx*_ga_LT1E7CELCT*czE3NDkxNTgwMjkkbzckZzEkdDE3NDkxNTkwOTgkajE1JGww'>schedule a private tour today</a>.
</div>

3. FAQ Section (3-5 Questions)
Structure as:
<div class="faq-section">
    <h2 class="blog-h2">Frequently Asked Questions</h2>
    <div class="faq-item">
        <div class="faq-question">[Question]</div>
        <p>[Answer]</p>
    </div>
</div>

4. Final CTA Section
Include compelling call-to-action in:
<div class="cta-section">
    <h2 class="blog-h2">[CTA Heading]</h2>
    <p>[CTA Content]</p>
    <div class="cta-buttons">
        <a href="[LINK]" class="cta-button">[BUTTON TEXT]</a>
        <a href="[LINK]" class="cta-button">[BUTTON TEXT]</a>
    </div>
</div>

INTERNAL LINK USAGE
Choose from any of these URLs for the internal links that are contextually correct within the blog post:
• Wedding Brochure: https://mileaestatevineyard.com/wp-content/uploads/2024/09/MEV_Wedding-Brochure.pdf
• Wedding Page: https://mileaestatevineyard.com/weddings/
• Wine Club: https://mileaestatevineyard.com/wine-club/
• Book Tours/Events: https://app.perfectvenue.com/venues/milea-estate-vineyard/hello?_gl=1*s6id2k*_gcl_aw*R0NMLjE3NDM1MzMxMzUuQ2owS0NRanduYTZfQmhDYkFSSXNBTElkMlowQ2g3T0FMTllVdzgwM2dHZWVHT3NITkpReXBmMzhBRjZqUC13Y0VULW1mOUZ6M185NHpfa2FBZzFGRUFMd193Y0I.*_gcl_au*MjQwNTIwNjM0LjE3NDkxNDMwMTk.*_ga*MTg3NDU4MzIzMS4xNzQwNTkzMDUx*_ga_LT1E7CELCT*czE3NDkxNTgwMjkkbzckZzEkdDE3NDkxNTkwOTgkajE1JGww
• Online Wine Shop: https://mileaestatevineyard.com/acquire/ 
• Wine Club Savings Calculator: https://club-calculator.netlify.app/
• About us: https://mileaestatevineyard.com/about/

EXTERNAL LINKS & INTERNAL LINKS
External Links: Include 3 relevant external links to: [EXTERNAL LINK 1], [EXTERNAL LINK 2], [EXTERNAL LINK 3]
Internal Links: End with 2-3 internal links formatted as:
<p><strong>Learn more about [topic]:</strong></p>
<ul>
    <li><a href="[INTERNAL LINK 1]">[Link Description]</a></li>
    <li><a href="[INTERNAL LINK 2]">[Link Description]</a></li>
    <li><a href="[INTERNAL LINK 3]">[Link Description]</a></li>
</ul>

PHOTOS 
Use the following photos within the text at 20-30% of the original size in areas of the text in which it makes sense following the text given the descriptions of the images I have provided below. Ensure that you display them in ways that aren't just right, center or left justified and that we are using text wrapping such that there aren't large gaps between text sections because of large photos (like a magazine)
• [PHOTO_1_DESC] – [PHOTO_1_LINK]
• [PHOTO_2_DESC] – [PHOTO_2_LINK]
• [PHOTO_3_DESC] – [PHOTO_3_LINK]
• [PHOTO_4_DESC] – [PHOTO_4_LINK]

BRAND VOICE & TONE
• Sophisticated yet approachable: Luxury vineyard aesthetic without pretension
• Storytelling focus: Emphasize the property's history, natural beauty, and authentic experiences
• Emotional connection: Help readers envision their special moments at Milea
• Local authority: Position as Hudson Valley experts and community leaders
• Sustainable values: Reference eco-friendly practices and farm-to-table philosophy

CONTENT ENHANCEMENT ELEMENTS
Stats Section (When Appropriate)
<div class="stats-section">
    <h2 class="blog-h2">[Stats Title]</h2>
    <div class="stats-grid">
        <div class="stat-item">
            <div class="stat-number">[NUMBER]</div>
            <div>[Description]</div>
        </div>
    </div>
</div>

Feature Cards (When Appropriate)
<div class="feature-grid">
    <div class="feature-card">
        <h4>[Feature Title]</h4>
        <p>[Feature Description]</p>
    </div>
</div>

FINAL DELIVERABLE FORMAT
Provide complete HTML document with:
1. Full DOCTYPE and head section with CSS
2. Body wrapped in <div class="milea-blog-content">
3. All content properly structured with required classes
4. All links correctly formatted and functional
5. Mobile-responsive design considerations included

POST-SPECIFIC CUSTOMIZATION:
• Keywords: [KEYWORDS]
• CTA Focus: [CTA_FOCUS]
• External Links: [EXTERNAL_LINKS]
• Internal Links: [INTERNAL_LINKS]
• Photo 1: [PHOTO_1_DESC] – [PHOTO_1_LINK]
• Photo 2: [PHOTO_2_DESC] – [PHOTO_2_LINK]
• Photo 3: [PHOTO_3_DESC] – [PHOTO_3_LINK]
• Photo 4: [PHOTO_4_DESC] – [PHOTO_4_LINK]

REMEMBER: Always maintain the luxury vineyard aesthetic, include proper spacing with clearfix classes, and ensure all styling is contained within the .milea-blog-content wrapper to prevent website header conflicts.`,
  fields: [
    {
      id: 'title',
      label: 'Blog Title',
      type: 'text',
      placeholder: 'Enter blog post title',
      excelColumn: 'Title',
      required: true,
      description: 'The main title of the blog post'
    },
    {
      id: 'keywords',
      label: 'SEO Keywords',
      type: 'text',
      placeholder: 'Enter comma-separated keywords',
      excelColumn: 'Keywords',
      required: true,
      description: 'Comma-separated list of SEO keywords'
    },
    {
      id: 'content_requirements',
      label: 'Content Requirements',
      type: 'textarea',
      placeholder: 'Enter any specific content requirements',
      required: false,
      description: 'Any specific requirements for the content'
    },
    {
      id: 'cta_focus',
      label: 'CTA Focus',
      type: 'text',
      placeholder: 'Enter main call-to-action focus',
      excelColumn: 'CTA',
      required: true,
      description: 'The main call-to-action for the post'
    },
    {
      id: 'external_links',
      label: 'External Links (3)',
      type: 'array',
      placeholder: 'Enter external links, comma-separated',
      excelColumn: 'External Links',
      required: false,
      description: 'Three external links to include in the post'
    },
    {
      id: 'internal_links',
      label: 'Internal Links (2-3)',
      type: 'array',
      placeholder: 'Enter internal links, comma-separated',
      excelColumn: 'Internal Links',
      required: false,
      description: 'Two to three internal links to include'
    },
    {
      id: 'photo_1_desc',
      label: 'Photo 1 Description',
      type: 'text',
      placeholder: 'Describe photo 1',
      required: false,
      description: 'Description of the first photo'
    },
    {
      id: 'photo_1_link',
      label: 'Photo 1 Link',
      type: 'text',
      placeholder: 'Enter photo 1 URL',
      required: false,
      description: 'URL for the first photo'
    },
    {
      id: 'photo_2_desc',
      label: 'Photo 2 Description',
      type: 'text',
      placeholder: 'Describe photo 2',
      required: false,
      description: 'Description of the second photo'
    },
    {
      id: 'photo_2_link',
      label: 'Photo 2 Link',
      type: 'text',
      placeholder: 'Enter photo 2 URL',
      required: false,
      description: 'URL for the second photo'
    },
    {
      id: 'photo_3_desc',
      label: 'Photo 3 Description',
      type: 'text',
      placeholder: 'Describe photo 3',
      required: false,
      description: 'Description of the third photo'
    },
    {
      id: 'photo_3_link',
      label: 'Photo 3 Link',
      type: 'text',
      placeholder: 'Enter photo 3 URL',
      required: false,
      description: 'URL for the third photo'
    },
    {
      id: 'photo_4_desc',
      label: 'Photo 4 Description',
      type: 'text',
      placeholder: 'Describe photo 4',
      required: false,
      description: 'Description of the fourth photo'
    },
    {
      id: 'photo_4_link',
      label: 'Photo 4 Link',
      type: 'text',
      placeholder: 'Enter photo 4 URL',
      required: false,
      description: 'URL for the fourth photo'
    }
  ],
  version: '1.0.0',
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
  return [defaultMileaTemplate];
};

export const saveTemplates = (templates: TemplateMapping[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prompt-templates', JSON.stringify(templates));
  }
}; 