import { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import { motion } from 'framer-motion';
import { Loader2, Languages, RefreshCw } from 'lucide-react';
import { newsApi } from '../services/api';
import type { NewsItem } from '../services/types';

const HindiNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHindiNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Search for Hindi news specifically
      // Ideally, the backend would support a language filter.
      // For now, we search for "Hindi news" and "India news"
      const response = await newsApi.searchNews("Hindi news India");
      setNews(response.news);
    } catch (err) {
      console.error('Error fetching Hindi news:', err);
      setError('Failed to fetch Hindi news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHindiNews();
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center max-w-2xl mx-auto mb-12">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mb-4"
        >
          <Languages className="w-8 h-8" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600"
        >
          Hindi News
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          Top stories from India and around the world, curated for Hindi readers.
        </motion.p>
      </header>

      <div className="flex justify-end px-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchHindiNews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Fetching latest updates...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 bg-destructive/10 rounded-xl border border-destructive/20">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={fetchHindiNews}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No news found.</p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <NewsCard
              key={item.id}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default HindiNews;
