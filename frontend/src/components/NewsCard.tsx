import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Share2, TrendingUp, TrendingDown, Minus, Play, Sparkles } from 'lucide-react';
import ArticleEnhancer from './ArticleEnhancer';

interface NewsCardProps {
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl?: string;
  url: string;
  category: string;
  index: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
}

const SentimentBadge = ({ sentiment }: { sentiment?: string; score?: number }) => {
  if (!sentiment) return null;
  
  const config = {
    positive: { icon: TrendingUp, color: 'bg-green-500/20 text-green-600', label: 'Positive' },
    negative: { icon: TrendingDown, color: 'bg-red-500/20 text-red-600', label: 'Negative' },
    neutral: { icon: Minus, color: 'bg-gray-500/20 text-gray-600', label: 'Neutral' }
  };
  
  const { icon: Icon, color, label } = config[sentiment as keyof typeof config] || config.neutral;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
};

const NewsCard = ({ title, summary, source, date, imageUrl, url, category, index, sentiment, sentimentScore }: NewsCardProps) => {
  const isVideo = title.toLowerCase().includes('video') || url.includes('youtube') || category === 'Video';
  const [showEnhancer, setShowEnhancer] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop"}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full backdrop-blur-sm shadow-sm">
            {category}
          </span>
        </div>
        {sentiment && (
          <div className="absolute top-4 right-4">
            <SentimentBadge sentiment={sentiment} score={sentimentScore} />
          </div>
        )}

        {isVideo && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="bg-black/40 rounded-full p-3 backdrop-blur-sm border border-white/20">
               <Play className="w-8 h-8 text-white fill-white" />
             </div>
           </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="font-medium text-primary">{source}</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{date}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
          {summary}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowEnhancer(true)}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary hover:text-primary/80 group/btn"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {isVideo ? 'Watch Video' : 'Read More'}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <ArticleEnhancer
        isOpen={showEnhancer}
        onClose={() => setShowEnhancer(false)}
        articleUrl={url}
        articleTitle={title}
      />
    </motion.div>
  );
};

export default NewsCard;
