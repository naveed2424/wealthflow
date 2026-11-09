export interface BlogImage {
  url: string;
  alt: string;
  caption: string;
  placement?: string;
}

export interface BlogSection {
  h2: string;
  content: string; // rich markdown / paragraphs / bullet points
  image?: BlogImage;
}

export interface InternalLinkItem {
  anchorText: string;
  targetUrl: string;
  reason?: string;
}

export interface ExternalSourceItem {
  title: string;
  url: string;
  domain: string;
  credibilityNote?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  readTime: string;
  wordCount?: number;
  date: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featuredImage: BlogImage;
  introduction: string;
  sections: BlogSection[];
  realWorldImpact?: string;
  keyTakeaways: string[];
  internalLinks: InternalLinkItem[];
  externalSources: ExternalSourceItem[];
  faq: FAQItem[];
  conclusion: string;
  callToAction: string;
  views?: number;
  likes?: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  gradient: string;
  accentColor: string;
  articleCount?: number;
}
