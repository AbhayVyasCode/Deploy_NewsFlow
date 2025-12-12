import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NewsCard from '../components/NewsCard';
import CategoryFilter from '../components/CategoryFilter';
import { newsApi } from '../services/api';
import type { NewsItem } from '../services/types';
import { Loader2 } from 'lucide-react';

const CATEGORIES = ["All", "General", "Technology", "Business", "Science", "Health", "Entertainment", "Sports"];

const Trends = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsApi.getTrends(category);
      setNews(response.news);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Failed to fetch trending news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl md:text-4xl font-bold tracking-tight text-special"
        >
          Trending Now
        </motion.h1>
        <p className="text-muted-foreground text-lg">
          Top stories across 30+ categories.
        </p>
      </header>
      
      <CategoryFilter 
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading {selectedCategory} news...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 bg-destructive/10 rounded-xl border border-destructive/20">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
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

export default Trends;
