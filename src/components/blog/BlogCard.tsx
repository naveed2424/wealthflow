import React from 'react';
import { Clock, Eye, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { BlogPost } from '../../types/blog';

interface BlogCardProps {
  post: BlogPost;
  onSelect: (post: BlogPost) => void;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onSelect, featured = false }) => {
  return (
    <article
      onClick={() => onSelect(post)}
      className={`group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-950/30 ${
        featured ? 'md:grid md:grid-cols-12 md:gap-8 p-6 lg:p-8' : 'p-5 sm:p-6'
      }`}
    >
      {/* Featured / Card Image */}
      <div className={`relative overflow-hidden rounded-2xl bg-slate-950 ${featured ? 'md:col-span-7 h-64 md:h-80' : 'h-48 mb-5'}`}>
        <img
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Category Badge on image */}
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-lg">
            {post.category}
          </span>
        </div>

        {/* Read time pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
          <Clock className="w-3 h-3 text-emerald-400" />
          {post.readTime}
          {post.wordCount && (
            <span className="text-slate-400 border-l border-slate-600 pl-1.5 ml-0.5">
              {post.wordCount} words
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-between flex-1 ${featured ? 'md:col-span-5 py-2' : ''}`}>
        <div>
          {/* Metadata info */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
            <span>{post.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              {(post.views || 2400).toLocaleString()}
            </span>
            <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/20 px-2 py-0.5 rounded">
              SEO 98/100
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-extrabold text-white group-hover:text-emerald-400 transition-colors leading-snug tracking-tight ${
            featured ? 'text-xl sm:text-2xl mb-3' : 'text-base sm:text-lg mb-2'
          }`}>
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4">
            {post.metaDescription}
          </p>
        </div>

        {/* Author Bio & Action */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
            />
            <div>
              <div className="text-xs font-bold text-slate-200">{post.author.name}</div>
              <div className="text-[10px] text-slate-400">{post.author.role}</div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            Read Guide
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
