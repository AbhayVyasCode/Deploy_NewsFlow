import { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Zap } from 'lucide-react';
import { newsApi } from '../services/api';
import type { NewsItem } from '../services/types';
import Hero3D from '../components/Hero3D';

const Feed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      let categories: string[] = [];
      
      const savedPrefs = localStorage.getItem("newsflow_preferences");
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          if (parsed.categories && Array.isArray(parsed.categories)) {
            categories = parsed.categories;
          }
        } catch (e) {
          console.error("Failed to parse preferences", e);
        }
      }

      if (query) {
        const response = await newsApi.searchNews(query);
        setNews(response.news);
      } else {
        // If categories is empty, backend will now handle it as "All" (or we pass explicit ["All"] if needed, but empty list is standard for "no filter")
        const response = await newsApi.getFeed(categories.length > 0 ? categories : []); 
        setNews(response.news);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchNews(query);
  };

  const handleRefresh = () => {
    fetchNews(searchQuery || undefined);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="relative space-y-4 text-center max-w-4xl mx-auto mb-12 pt-16 pb-8">
        {/* 3D Content Background for Header */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-30 pointer-events-none z-0">
             <Hero3D />
        </div>

        <div className="relative z-10">
            <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4"
            >
            <Zap className="w-4 h-4 fill-primary" />
            <span>Live AI News Feed</span>
            </motion.div>
            
            <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold tracking-tight text-special mb-6"
            >
            Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Extraordinary</span>
            </motion.h1>
            
            <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
            >
            {searchQuery ? `Showing results for "${searchQuery}"` : 'AI-curated insights from the world\'s most trusted sources.'}
            </motion.p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto sticky top-4 z-20 backdrop-blur-xl bg-background/50 p-2 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={handleRefresh}
            disabled={loading}
            className="p-3 bg-secondary/80 hover:bg-secondary rounded-xl transition-colors disabled:opacity-50 text-foreground"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse text-lg font-medium">Curating your feed...</p>
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-4"
        >
          <div className="bg-destructive/10 text-destructive p-6 rounded-2xl max-w-md mx-auto border border-destructive/20 backdrop-blur-sm">
            <p className="font-semibold text-lg mb-2">Something went wrong</p>
            <p className="mb-6 opacity-90">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-6 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {!loading && !error && news.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32"
        >
          <p className="text-muted-foreground text-xl">No stories found. Try exploring a different topic.</p>
        </motion.div>
      )}

      {!loading && !error && news.length > 0 && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2"
        >
          <AnimatePresence mode="popLayout">
            {news.map((item, index) => (
              <motion.div key={item.id} variants={itemVariants} layout>
                <NewsCard
                  index={index}
                  title={item.title}
                  summary={item.summary}
                  source={item.source}
                  date={item.published_at}
                  category={item.category}
                  url={item.url}
                  imageUrl={item.image_url}
                  sentiment={item.sentiment}
                  sentimentScore={item.sentiment_score}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};


export default Feed;
