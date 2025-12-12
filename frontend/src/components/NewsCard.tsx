import { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
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
    positive: { icon: TrendingUp, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Positive' },
    negative: { icon: TrendingDown, color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Negative' },
    neutral: { icon: Minus, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Neutral' }
  };
  
  const { icon: Icon, color, label } = config[sentiment as keyof typeof config] || config.neutral;
  
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
};

const NewsCard = ({ title, summary, source, date, imageUrl, url, category, index, sentiment, sentimentScore }: NewsCardProps) => {
  const isVideo = title.toLowerCase().includes('video') || url.includes('youtube') || category === 'Video';
  const [showEnhancer, setShowEnhancer] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]); // Invert tilt for X
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    // Calculate normalized position (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;
    
    const mouseXVal = (e.clientX - rect.left) / width - 0.5;
    const mouseYVal = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseXVal);
    y.set(mouseYVal);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{
        perspective: 1000,
      }}
      className="h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="group relative h-full flex flex-col glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300"
      >
        <div className="relative h-52 overflow-hidden" style={{ transform: 'translateZ(20px)' }}>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            
            <img
            src={imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop"}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Other elements remain similar but can have slight Z translate if needed for more depth */}
            <div className="absolute top-4 left-4 z-20 flex gap-2" style={{ transform: 'translateZ(30px)' }}>
            <span className="px-3 py-1 text-xs font-semibold bg-black/60 text-white border border-white/10 rounded-full backdrop-blur-md shadow-sm">
                {category}
            </span>
            </div>
            
            {sentiment && (
            <div className="absolute top-4 right-4 z-20" style={{ transform: 'translateZ(30px)' }}>
                <SentimentBadge sentiment={sentiment} score={sentimentScore} />
            </div>
            )}

            {isVideo && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ transform: 'translateZ(40px)' }}>
                <motion.div 
                whileHover={{ scale: 1.1 }}
                className="bg-white/20 rounded-full p-4 backdrop-blur-md border border-white/30 text-white shadow-xl"
                >
                <Play className="w-8 h-8 fill-white" />
                </motion.div>
            </div>
            )}
        </div>

        <div className="p-6 flex flex-col flex-grow relative z-10" style={{ transform: 'translateZ(20px)' }}>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{source}</span>
            <div className="flex items-center gap-1.5 opacity-70">
                <Calendar className="w-3.5 h-3.5" />
                <span>{date}</span>
            </div>
            </div>

            <a href={url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
            <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300 text-special">
                {title}
            </h3>
            </a>
            
            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
            {summary}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <div className="flex gap-2">
            {!isVideo && (
                <motion.button 
                whileHover={{ scale: 1.1, translateZ: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEnhancer(true)}
                className="p-2 hover:bg-primary/20 rounded-full transition-colors text-primary"
                title="AI Enhance"
                >
                <Sparkles className="w-4 h-4" />
                </motion.button>
            )}
                <motion.button 
                whileHover={{ scale: 1.1, translateZ: 10 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                >
                <Share2 className="w-4 h-4" />
                </motion.button>
            </div>
            
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                style={{ transform: 'translateZ(10px)' }}
            >
                {isVideo ? 'Watch Video' : 'Read Article'}
                <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
            </a>
            </div>
        </div>

        <div className="absolute inset-0 border-2 border-primary/0 rounded-2xl group-hover:border-primary/50 transition-colors duration-500 pointer-events-none" />

        <ArticleEnhancer
            isOpen={showEnhancer}
            onClose={() => setShowEnhancer(false)}
            articleUrl={url}
            articleTitle={title}
        />
      </motion.div>
    </motion.div>
  );
};

export default NewsCard;
