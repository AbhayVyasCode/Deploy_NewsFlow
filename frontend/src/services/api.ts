import axios from "axios";
import type {
  NewsItem,
  SearchResponse,
  TrendsResponse,
  FeedResponse,
  ChatMessage,
  ChatResponse,
  DigestResponse,
  SummarizeResponse,
  TranslateResponse,
} from "./types";

export type { NewsItem, SearchResponse, TrendsResponse, FeedResponse, ChatResponse, DigestResponse, SummarizeResponse, TranslateResponse };

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // 60 second timeout for AI operations
});

export const newsApi = {
  searchNews: async (query: string, date?: string, categories?: string[]): Promise<SearchResponse> => {
    const response = await api.post("/news/search", { query, date, categories, limit: 25 });
    return response.data;
  },

  getTrends: async (category: string, limit: number = 25): Promise<TrendsResponse> => {
    const response = await api.get(`/news/trends/${category}`, { params: { limit } });
    return response.data;
  },

  getFeed: async (categories: string[], limit: number = 25): Promise<FeedResponse> => {
    const response = await api.get("/news/feed", {
      params: { categories: categories.join(","), limit },
    });
    return response.data;
  },

  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await api.get("/news/categories");
    return response.data;
  },

  // NEW AI FEATURES
  chat: async (message: string, history?: ChatMessage[]): Promise<ChatResponse> => {
    const response = await api.post("/news/chat", { message, history });
    return response.data;
  },

  getDigest: async (categories?: string[]): Promise<DigestResponse> => {
    const response = await api.post("/news/digest", { categories });
    return response.data;
  },

  getRelated: async (query: string, limit: number = 5): Promise<{ related: NewsItem[]; query: string }> => {
    const response = await api.get(`/news/related/${encodeURIComponent(query)}`, { params: { limit } });
    return response.data;
  },

  // Article Enhancement Features
  summarizeArticle: async (url: string): Promise<SummarizeResponse> => {
    const response = await api.post("/news/summarize", { url });
    return response.data;
  },

  summarizeVideo: async (url: string): Promise<SummarizeResponse> => {
    const response = await api.post("/news/summarize", { url });
    return response.data;
  },


  translateText: async (text: string, targetLanguage: string): Promise<TranslateResponse> => {
    const response = await api.post("/news/translate", { text, target_language: targetLanguage });
    return response.data;
  },

  speakText: async (text: string, language: string): Promise<Blob> => {
    const response = await api.post("/news/speak", { text, language }, { responseType: 'blob' });
    return response.data;
  },

  // Video News
  getVideoNews: async (query: string = "latest news", limit: number = 15): Promise<{ success: boolean; videos: NewsItem[]; total: number }> => {
    const response = await api.get("/news/videos", { params: { query, limit } });
    return response.data;
  },

  getTrendingVideos: async (limit: number = 15): Promise<{ success: boolean; videos: NewsItem[]; total: number }> => {
    const response = await api.get("/news/videos/trending", { params: { limit } });
    return response.data;
  },

  getVideosByCategory: async (category: string, limit: number = 15): Promise<{ success: boolean; videos: NewsItem[]; total: number }> => {
    const response = await api.get(`/news/videos/category/${category}`, { params: { limit } });
    return response.data;
  },
};

export default newsApi;
