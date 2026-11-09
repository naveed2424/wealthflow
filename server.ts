import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wealthflow-api', timestamp: new Date().toISOString() });
});

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated stock financial and AI imagery for realistic media embedding
const fallbackImages = [
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
];

// Endpoint: Generate high-ranking, 2000+ words SEO article following user's structured SEO Prompt
app.post('/api/generate-blog', async (req, res) => {
  try {
    const { prompt: userPrompt, categoryHint } = req.body;
    const topicInstruction = userPrompt || "Write today's best and trending topic in AI Tools & Personal Finance / Budgeting";

    const systemPrompt = `You are an elite financial journalist, SEO expert, and content strategist for 'FinAI Wealth & Smart Budgeting Portal'.
Your mission is to produce a comprehensive, deep-dive, engaging, and 100% fact-based article adhering to the following strict SEO format.
Target Word Count: Minimum 1,800 to 2,200 words of rich, substantive, informative text (do not write short placeholders).

Categories available (must pick the best fit):
1. AI Budgeting & Money Trackers
2. Smart Saving & Frugal Living Tech
3. Wealth Building & Investing AI
4. Debt Elimination & Credit Optimization
5. Side Hustles & AI Income Streams
6. Future of Money & FinTech News

CONTENT REQUIREMENTS:
1. Highly clickable, emotional, CTR-focused Headline.
2. Engaging Hook & Intro explaining why this matters right now in 2025/2026.
3. Detailed background context for beginners.
4. 4 to 6 comprehensive sections with H2 & H3s, covering:
   - Latest developments, algorithms, and real breakthrough apps
   - Key financial statistics, benchmarks, and data
   - Expert insights and industry commentary
   - Real-world economic & personal lifestyle impact
5. In-content Image Suggestions with rich ALT TEXT (CTR & SEO optimized) and Placement instructions.
6. Primary keyword and 3-6 secondary keywords naturally integrated.
7. Meta Title (50-60 chars) & Meta Description (150-160 chars).
8. 2-5 Internal linking recommendations within the portal (e.g., /tracker, /savings-simulator, /category/smart-saving).
9. 1-3 External authoritative references (e.g., Federal Reserve reports, MIT FinTech Lab, Bloomberg, Morningstar).
10. Bulleted Key Takeaways summary.
11. FAQ section with 3-4 practical questions and answers.
12. Inspiring conclusion with future outlook and engagement Call to Action (CTA).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Request: "${topicInstruction}". Category hint: "${categoryHint || 'auto-detect'}".
Generate the complete structured blog post as valid JSON strictly adhering to the schema. Make the content thorough, authoritative, and practical.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Emotional CTR-focused headline' },
            metaTitle: { type: Type.STRING, description: 'SEO title 50-60 chars' },
            metaDescription: { type: Type.STRING, description: 'SEO description 150-160 chars' },
            category: { type: Type.STRING, description: 'One of the 6 official categories' },
            primaryKeyword: { type: Type.STRING },
            secondaryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            readTime: { type: Type.STRING, description: 'e.g. 9 min read' },
            featuredImage: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                alt: { type: Type.STRING },
                caption: { type: Type.STRING },
              },
              required: ['alt', 'caption'],
            },
            introduction: { type: Type.STRING, description: 'Engaging hook and background context (several paragraphs)' },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  h2: { type: Type.STRING },
                  content: { type: Type.STRING, description: 'In-depth section analysis with facts, bullet points, data points' },
                  image: {
                    type: Type.OBJECT,
                    properties: {
                      url: { type: Type.STRING },
                      alt: { type: Type.STRING },
                      caption: { type: Type.STRING },
                      placement: { type: Type.STRING },
                    },
                    required: ['alt', 'caption'],
                  },
                },
                required: ['h2', 'content'],
              },
            },
            realWorldImpact: { type: Type.STRING, description: 'Analysis of impact on everyday household budgets and global economy' },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            internalLinks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  anchorText: { type: Type.STRING },
                  targetUrl: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['anchorText', 'targetUrl'],
              },
            },
            externalSources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  domain: { type: Type.STRING },
                  credibilityNote: { type: Type.STRING },
                },
                required: ['title', 'url', 'domain'],
              },
            },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
            },
            conclusion: { type: Type.STRING, description: 'Strategic conclusion with future outlook' },
            callToAction: { type: Type.STRING, description: 'Compelling CTA for reader feedback and action' },
          },
          required: [
            'title',
            'metaTitle',
            'metaDescription',
            'category',
            'primaryKeyword',
            'secondaryKeywords',
            'readTime',
            'introduction',
            'sections',
            'keyTakeaways',
            'internalLinks',
            'faq',
            'conclusion',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Populate high-resolution realistic financial photography if URLs are placeholder
    if (!parsedData.featuredImage?.url || parsedData.featuredImage.url.startsWith('http') === false) {
      parsedData.featuredImage = {
        url: fallbackImages[0],
        alt: parsedData.featuredImage?.alt || parsedData.title,
        caption: parsedData.featuredImage?.caption || 'Automated AI wealth strategy and budgeting insights.',
      };
    }

    if (Array.isArray(parsedData.sections)) {
      parsedData.sections.forEach((sec: any, index: number) => {
        if (!sec.image || !sec.image.url || !sec.image.url.startsWith('http')) {
          sec.image = {
            url: fallbackImages[(index + 1) % fallbackImages.length],
            alt: sec.image?.alt || `${sec.h2} visual breakdown`,
            caption: sec.image?.caption || `Visual analysis: ${sec.h2}`,
            placement: 'Between core analysis sections',
          };
        }
      });
    }

    // Add generated metadata
    const generatedArticle = {
      id: 'finai-' + Date.now(),
      slug: parsedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: {
        name: 'Dr. Sarah Sterling, CFA',
        role: 'Chief FinTech Strategist & AI Economist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
      ...parsedData,
    };

    res.json({ success: true, article: generatedArticle });
  } catch (error: any) {
    console.error('Error generating blog:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate trending SEO blog post. Please check Gemini API configuration.',
    });
  }
});

// Endpoint: AI Budgeting & Expense Coach
app.post('/api/analyze-spending', async (req, res) => {
  try {
    const { income, expenses, savingsGoal, currency } = req.body;

    const prompt = `Analyze this personal finance portfolio and provide 4 punchy, high-impact money-saving hacks and 2 cutting-edge AI tools the user should adopt:
Monthly Income: ${currency || '$'}${income}
Expenses Breakdown: ${JSON.stringify(expenses)}
Savings Goal: ${currency || '$'}${savingsGoal}

Format output as concise JSON:
{
  "healthScore": number (0-100),
  "statusSummary": "string",
  "monthlySavingsEstimated": "string",
  "leaksIdentified": ["string"],
  "aiToolRecommendations": [
    { "name": "string", "category": "string", "benefit": "string" }
  ],
  "actionSteps": ["string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json({ success: true, analysis: JSON.parse(response.text || '{}') });
  } catch (error: any) {
    console.error('Error analyzing spending:', error);
    res.status(500).json({ success: false, error: error.message || 'Analysis failed' });
  }
});

// Setup Vite middleware for local development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinAI Wealth Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
