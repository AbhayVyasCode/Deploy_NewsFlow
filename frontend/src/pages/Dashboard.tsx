import { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { newsApi } from '../services/api';
import type { NewsItem } from '../services/types';

const Dashboard = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (query) {
        const response = await newsApi.searchNews(query);
        setNews(response.news);
      } else {
        const response = await newsApi.getFeed(['Technology', 'Science', 'Business']);
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

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center max-w-2xl mx-auto mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"
        >
          Your Daily Briefing
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          {searchQuery ? `Results for "${searchQuery}"` : 'AI-curated news based on your interests.'}
        </motion.p>
      </header>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={loading}
          className="p-3 bg-secondary hover:bg-secondary/80 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Fetching news with AI...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 bg-destructive/10 rounded-xl border border-destructive/20">
          <p className="text-destructive font-medium">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No news found. Try a different search.</p>
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

export default Dashboard;
