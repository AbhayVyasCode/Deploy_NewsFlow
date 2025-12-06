import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Calendar } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { newsApi } from '../services/api';
import type { NewsItem } from '../services/types';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    
    try {
      const response = await newsApi.searchNews(query, date || undefined);
      setNews(response.news);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          Search News
        </motion.h1>
        <p className="text-muted-foreground text-lg">
          Search for any topic and get AI-curated results.
        </p>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSearch}
        className="max-w-3xl mx-auto space-y-4"
      >
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for any news topic..."
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Search
          </button>
        </div>
      </motion.form>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Searching with AI...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 bg-destructive/10 rounded-xl border border-destructive/20">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {!loading && searched && news.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
        </div>
      )}

      {!loading && news.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold">
            Found {news.length} results for "{query}"
          </h2>
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
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchPage;
