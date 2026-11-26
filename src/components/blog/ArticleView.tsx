import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Download, 
  Search, 
  Sparkles,
  Link2,
  Bookmark,
  ThumbsUp
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { AdBanner } from '../AdBanner';

interface ArticleViewProps {
  post: BlogPost;
  onBack: () => void;
  onNavigateInternal: (path: string) => void;
  onOpenSEOScorecard: (post: BlogPost) => void;
  adSenseEnabled: boolean;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  onBack,
  onNavigateInternal,
  onOpenSEOScorecard,
  adSenseEnabled,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 184);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}`;
      setReadingProgress(Math.min(100, Math.max(0, parseFloat(scroll))));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const handleLike = () => {
    if (!liked) {
      setLikesCount(prev => prev + 1);
      setLiked(true);
    } else {
      setLikesCount(prev => prev - 1);
      setLiked(false);
    }
  };

  const siteOrigin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-dev-jaqzasdnamfwsy27pcee4a-128012116128.europe-west2.run.app';
  const canonicalArticleUrl = `${siteOrigin}/?article=${encodeURIComponent(post.slug)}`;

  const renderInlineFormatting = (text: string): React.ReactNode => {
    const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g;
    const parts = text.split(tokenRegex);
    return parts.map((part, idx) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isSelfDomain =
          href.includes('ais-dev-jaqzasdnamfwsy27pcee4a-128012116128.europe-west2.run.app') ||
          href.includes('ais-pre-jaqzasdnamfwsy27pcee4a-128012116128.europe-west2.run.app') ||
          href.startsWith(siteOrigin);
        return (
          <a
            key={idx}
            href={href}
            onClick={(e) => {
              if (!isSelfDomain) return;
              try {
                const parsed = new URL(href);
                const tabParam = parsed.searchParams.get('tab');
                const articleParam = parsed.searchParams.get('article');
                if (articleParam) {
                  e.preventDefault();
                  onNavigateInternal(`/article/${articleParam}`);
                } else if (tabParam === 'tracker') {
                  e.preventDefault();
                  onNavigateInternal('/tracker');
                } else if (tabParam === 'simulator') {
                  e.preventDefault();
                  onNavigateInternal('/savings-simulator');
                } else if (tabParam === 'savings-goals') {
                  e.preventDefault();
                  onNavigateInternal('/savings-goals');
                } else if (tabParam === 'debt-payoff') {
                  e.preventDefault();
                  onNavigateInternal('/debt-payoff');
                } else if (tabParam === 'daily-tools') {
                  e.preventDefault();
                  onNavigateInternal('/daily-tools');
                } else if (tabParam === 'about') {
                  e.preventDefault();
                  onNavigateInternal('/about');
                }
              } catch {
                // fallback to native link navigation
              }
            }}
            target={isSelfDomain ? undefined : '_blank'}
            rel={isSelfDomain ? 'noopener' : 'noopener noreferrer'}
            className="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/50 underline-offset-2 font-semibold transition"
          >
            {label}
          </a>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} className="text-white font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(canonicalArticleUrl);
      alert('Canonical article backlink copied to clipboard!');
    }
  };

  const handleCopyBacklink = (mode: 'url' | 'html' | 'markdown') => {
    const snippet =
      mode === 'url'
        ? canonicalArticleUrl
        : mode === 'html'
        ? `<a href="${canonicalArticleUrl}" rel="noopener">${post.title} — WealthFlow AI</a>`
        : `[${post.title} — WealthFlow AI](${canonicalArticleUrl})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      alert(`${mode.toUpperCase()} backlink copied for redirecting traffic to WealthFlow AI!`);
    }
  };

  const handleExportMarkdown = () => {
    let md = `# ${post.title}\n\n`;
    md += `**Canonical Backlink:** [${post.title}](${canonicalArticleUrl})\n`;
    md += `**Meta Title:** ${post.metaTitle}\n`;
    md += `**Meta Description:** ${post.metaDescription}\n`;
    md += `**Primary Keyword:** ${post.primaryKeyword}\n`;
    md += `**Category:** ${post.category}\n\n`;
    md += `![${post.featuredImage.alt}](${post.featuredImage.url})\n*${post.featuredImage.caption}*\n\n`;
    md += `## Introduction\n\n${post.introduction}\n\n`;

    post.sections.forEach(sec => {
      md += `## ${sec.h2}\n\n${sec.content}\n\n`;
      if (sec.image) {
        md += `![${sec.image.alt}](${sec.image.url})\n*${sec.image.caption}*\n\n`;
      }
    });

    if (post.realWorldImpact) {
      md += `## Real-World Impact\n\n${post.realWorldImpact}\n\n`;
    }

    md += `## Key Takeaways\n\n`;
    post.keyTakeaways.forEach(k => {
      md += `- ${k}\n`;
    });
    md += `\n`;

    md += `## Frequently Asked Questions (FAQ)\n\n`;
    post.faq.forEach(f => {
      md += `### ${f.question}\n${f.answer}\n\n`;
    });

    md += `## Conclusion\n\n${post.conclusion}\n\n`;
    md += `**Call to Action:** ${post.callToAction}\n\n`;
    md += `---\n*Originally published on [WealthFlow AI](${siteOrigin}) — Read full interactive calculators & guide: ${canonicalArticleUrl}*\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug || 'finai-article'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      {/* Reading Progress Indicator at top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-900 z-50">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-semibold group transition"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSEOScorecard(post)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 px-3 py-1.5 rounded-xl transition shadow"
            >
              <Search className="w-3.5 h-3.5" />
              Inspect SEO Scorecard
            </button>
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl transition"
              title="Download as Markdown file for WordPress or Ghost"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
              title="Share article"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AdSense Top Leaderboard */}
        <AdBanner format="leaderboard" enabled={adSenseEnabled} />

        {/* SEO Meta Snippet Preview Card (Demonstrating rich snippet readiness) */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] mb-1">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Sparkles className="w-3 h-3" />
              SEO Snippet & Google SERP Preview
            </span>
            <span>Target: {post.primaryKeyword}</span>
          </div>
          <div className="text-emerald-400 font-medium truncate font-sans text-sm">
            {post.metaTitle}
          </div>
          <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            {post.metaDescription}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
            <span className="text-slate-400 font-semibold">Secondary keywords:</span>
            {post.secondaryKeywords.map((kw, i) => (
              <span key={i} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Main Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {post.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
              {post.wordCount || 2050}+ words (In-Depth)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-emerald-500/40"
              />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  {post.author.name}
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs text-emerald-400 font-medium">{post.author.role}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Published on {post.date} • Verified Fact-Checked</div>
              </div>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition border ${
                liked
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {likesCount}
            </button>
          </div>
        </header>

        {/* Featured Image with ALT text display for transparency */}
        <figure className="mb-10 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            referrerPolicy="no-referrer"
            className="w-full h-80 sm:h-96 object-cover"
          />
          <figcaption className="p-3 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>{post.featuredImage.caption}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              [ALT: {post.featuredImage.alt}]
            </span>
          </figcaption>
        </figure>

        {/* Key Takeaways summary card (prominently placed for high user retention) */}
        <div className="mb-10 p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base mb-3">
            <Sparkles className="w-5 h-5" />
            Key Takeaways & Executive Summary
          </div>
          <ul className="space-y-2.5 text-sm text-slate-200">
            {post.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{renderInlineFormatting(takeaway)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none space-y-8 text-slate-200 leading-relaxed text-base sm:text-lg">
          {/* Introduction */}
          <div className="space-y-4">
            {post.introduction.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-slate-300 leading-relaxed text-base sm:text-lg">
                {renderInlineFormatting(paragraph)}
              </p>
            ))}
          </div>

          {/* First In-Article Ad Banner */}
          <AdBanner format="in-article" enabled={adSenseEnabled} />

          {/* Sections */}
          {post.sections.map((section, idx) => (
            <section key={idx} className="space-y-4 pt-4 border-t border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="text-emerald-400 text-sm font-mono">{idx + 1}.0</span>
                {section.h2}
              </h2>

              <div className="space-y-3">
                {section.content.split('\n\n').map((para, pIdx) => {
                  // Render markdown ### subheadings cleanly
                  if (para.startsWith('### ')) {
                    const lines = para.split('\n');
                    const headingText = lines[0].replace(/^###\s+/, '');
                    const restLines = lines.slice(1).filter(Boolean);
                    return (
                      <div key={pIdx} className="pt-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-amber-300 mb-2">
                          {headingText}
                        </h3>
                        {restLines.length > 0 && (
                          <ul className="space-y-2 my-2 pl-4 text-sm sm:text-base text-slate-300 list-disc list-inside">
                            {restLines.map((line, lIdx) => (
                              <li key={lIdx} className="leading-relaxed">
                                {renderInlineFormatting(line.replace(/^(-\s+|\d+\.\s+)/, ''))}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  }
                  // Render bullet lists nicely if paragraph contains bullets
                  if (para.includes('\n- ') || para.startsWith('- ')) {
                    const lines = para.split('\n');
                    return (
                      <ul key={pIdx} className="space-y-2 my-4 pl-4 text-sm sm:text-base text-slate-300 list-disc list-inside">
                        {lines.map((line, lIdx) => (
                          <li key={lIdx} className="leading-relaxed">
                            {renderInlineFormatting(line.replace(/^- /, ''))}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-slate-300 leading-relaxed text-sm sm:text-base">
                      {renderInlineFormatting(para)}
                    </p>
                  );
                })}
              </div>

              {/* In-content image if present */}
              {section.image && (
                <figure className="my-6 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={section.image.url}
                    alt={section.image.alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <figcaption className="p-3 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>{section.image.caption}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      [ALT: {section.image.alt}]
                    </span>
                  </figcaption>
                </figure>
              )}
            </section>
          ))}

          {/* Real-World Impact Section */}
          {post.realWorldImpact && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 my-8">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                Real-World Impact on Household Wealth
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {renderInlineFormatting(post.realWorldImpact)}
              </p>
            </div>
          )}

          {/* Internal Linking Suggestions Box */}
          {post.internalLinks && post.internalLinks.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 my-8">
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                <Link2 className="w-4 h-4 text-emerald-400" />
                Related Interactive Resources & Internal Guides
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {post.internalLinks.map((link, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigateInternal(link.targetUrl)}
                    className="text-left p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition group"
                  >
                    <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                      {link.anchorText}
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                    {link.reason && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {link.reason}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {/* Canonical Site Redirect Backlink Widget */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Canonical Site Redirect Backlink
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {canonicalArticleUrl}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyBacklink('url')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 transition"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleCopyBacklink('html')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 transition"
                  >
                    HTML Backlink
                  </button>
                  <button
                    onClick={() => handleCopyBacklink('markdown')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 transition"
                  >
                    MD Backlink
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* External Authoritative Sources for High SEO Score */}
          {post.externalSources && post.externalSources.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 my-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Verified Primary Sources & Academic Citations
              </h3>
              <div className="space-y-2">
                {post.externalSources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 hover:text-emerald-400">
                        {source.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{source.credibilityNote}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-3 flex items-center gap-1">
                      {source.domain}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Accordion Section */}
          <div className="my-10 pt-6 border-t border-slate-800">
            <h3 className="text-xl sm:text-2xl font-black text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="space-y-3">
              {post.faq.map((f, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-white text-sm hover:text-emerald-400 transition"
                    >
                      <span>{f.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-emerald-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-200">
                        {renderInlineFormatting(f.answer)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conclusion & Call to Action (CTA) */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/30 my-10">
            <h3 className="text-xl font-black text-white mb-3">Conclusion & Future Outlook</h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              {renderInlineFormatting(post.conclusion)}
            </p>
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Your Next Action Step
              </h4>
              <p className="text-xs sm:text-sm text-white font-medium mb-3">
                {renderInlineFormatting(post.callToAction)}
              </p>
              <button
                onClick={() => onNavigateInternal('/tracker')}
                className="text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2 rounded-xl transition shadow-lg"
              >
                Launch Live Budget Tracker
              </button>
            </div>
          </div>
        </div>

        {/* AdSense Bottom Rectangle */}
        <AdBanner format="rectangle" enabled={adSenseEnabled} />
      </div>
    </div>
  );
};
