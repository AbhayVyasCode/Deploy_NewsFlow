// Types for the News API

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  image_url?: string;
  category: string;
  published_at: string;
  sentiment?: "positive" | "negative" | "neutral";
  sentiment_score?: number;
}

export interface SearchResponse {
  success: boolean;
  news: NewsItem[];
  query: string;
  total: number;
}

export interface TrendsResponse {
  success: boolean;
  category: string;
  news: NewsItem[];
  total: number;
}

export interface FeedResponse {
  success: boolean;
  news: NewsItem[];
  categories: string[];
  total: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  sources?: string[];
}

export interface DigestResponse {
  digest: string;
  headlines: string[];
  generated_at: string;
}
