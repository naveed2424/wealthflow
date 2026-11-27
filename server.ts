import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { REGISTERED_SEO_PROMPT } from './src/data/registeredSeoPrompt';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const SITE_ORIGIN = 'https://ais-dev-jaqzasdnamfwsy27pcee4a-128012116128.europe-west2.run.app';

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wealthflow-api', timestamp: new Date().toISOString() });
});

app.get('/api/seo-prompt', (_req, res) => {
  res.json({ success: true, registeredPrompt: REGISTERED_SEO_PROMPT });
});

app.get('/sitemap.xml', (_req, res) => {
  const staticUrls = [
    { loc: `${SITE_ORIGIN}/`, freq: 'daily', priority: '1.0' },
    { loc: `${SITE_ORIGIN}/?tab=daily-tools`, freq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/?tab=tracker`, freq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/?tab=savings-goals`, freq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/?tab=simulator`, freq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/?tab=debt-payoff`, freq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/?tab=about`, freq: 'monthly', priority: '0.7' },
    { loc: `${SITE_ORIGIN}/?tab=privacy`, freq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/?tab=terms`, freq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/?tab=disclaimer`, freq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/?tab=contact`, freq: 'monthly', priority: '0.7' },
  ];

  const dataDir = path.resolve(__dirname, 'src', 'data');
  const slugSet = new Set<string>();
  try {
    for (const fileName of fs.readdirSync(dataDir)) {
      if (!fileName.endsWith('.ts')) continue;
      const content = fs.readFileSync(path.join(dataDir, fileName), 'utf8');
      for (const match of content.matchAll(/slug:\s*'([^']+)'/g)) {
        slugSet.add(match[1]);
      }
    }
  } catch {
    // keep static URLs if directory scan unavailable
  }

  const articleEntries = [...slugSet].map(slug => ({
    loc: `${SITE_ORIGIN}/?article=${encodeURIComponent(slug)}`,
    freq: 'weekly',
    priority: '0.8',
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticUrls,
    ...articleEntries,
  ]
    .map(
      u =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
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

// Curated unique stock financial, market, saving & crypto imagery (fresh verified URLs)
const fallbackImages = [
  'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1639815188546-c43c240ff4df?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80',
];

// Endpoint: Generate high-ranking, 2000+ words SEO article following registered Master SEO Prompt
app.post('/api/generate-blog', async (req, res) => {
  try {
    const { prompt: userPrompt, categoryHint } = req.body;
    const topicInstruction = userPrompt || REGISTERED_SEO_PROMPT.dailyTriggerCommand;

    const systemPrompt = `You are an elite financial journalist, SEO expert, and content strategist for 'WealthFlow AI — Personal Finance, Market, Savings & AI Tools Portal'.
Follow the user's REGISTERED MASTER SEO PROMPT (Version ${REGISTERED_SEO_PROMPT.version}) strictly for this and all future advanced blog posts:

=== REGISTERED MASTER SEO PROMPT ===
${REGISTERED_SEO_PROMPT.masterPromptTemplate}
=====================================

Categories available (must pick the best fit):
1. AI Budgeting & Money Trackers
2. Smart Saving & Frugal Living Tech
3. Wealth Building & Investing AI
4. Debt Elimination & Credit Optimization
5. Side Hustles & AI Income Streams
6. Future of Money & FinTech News

INTERNAL ROUTES FOR LINKING:
- /tracker (50/30/20 Budget & Milestones Tracker)
- /savings-goals (Deadline-Driven Savings Goals Planner)
- /savings-simulator (Compound Savings Simulator)
- /debt-payoff (Snowball & Avalanche Debt Payoff Calculator)
- /daily-tools (Daily Life Expense Tools & Money Flow)
- /category/ai-budgeting-trackers
- /category/smart-saving-frugal-tech
- /category/wealth-building-investing-ai
- /category/future-of-money-fintech`;

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
    console.log(`WealthFlow AI Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
