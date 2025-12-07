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

export interface SummarizeRequest {
  url: string;
}

export interface SummarizeResponse {
  summary: string;
  title?: string;
  original_text?: string;
}

export interface TranslateRequest {
  text: string;
  target_language: string; // 'hi' or 'en'
}

export interface TranslateResponse {
  translated_text: string;
  source_language?: string;
}

export interface TTSRequest {
  text: string;
  language: string; // 'hi' or 'en'
}
