"""
NewsAPI.org Service
Provides news search and headlines using NewsAPI.org
"""
import httpx
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.config import settings


class NewsAPIService:
    """Service class for interacting with NewsAPI.org"""
    
    BASE_URL = "https://newsapi.org/v2"
    
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.headers = {"X-Api-Key": self.api_key}
    
    async def search_news(
        self,
        query: str,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "relevancy",  # relevancy, popularity, publishedAt
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        language: str = "en"
    ) -> dict:
        """
        Search for news articles across all sources.
        
        Args:
            query: Search query
            page: Page number
            page_size: Number of results per page (max 100)
            sort_by: Sort order (relevancy, popularity, publishedAt)
            from_date: Start date (YYYY-MM-DD)
            to_date: End date (YYYY-MM-DD)
            language: Language code (e.g., en, es, fr)
        
        Returns:
            dict with status, totalResults, and articles
        """
        if not self.api_key:
            return {"status": "error", "message": "NEWS_API_KEY not configured", "articles": []}
        
        # Default date range: last 7 days
        if not from_date:
            from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        params = {
            "q": query,
            "page": page,
            "pageSize": min(page_size, 100),
            "sortBy": sort_by,
            "from": from_date,
            "language": language
        }
        
        if to_date:
            params["to"] = to_date
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/everything",
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_data = response.json()
                    return {
                        "status": "error",
                        "message": error_data.get("message", f"HTTP {response.status_code}"),
                        "articles": []
                    }
        except Exception as e:
            return {"status": "error", "message": str(e), "articles": []}

    def search_news_sync(
        self,
        query: str,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "relevancy",
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        language: str = "en"
    ) -> dict:
        """
        Synchronous wrapper for search_news to allow use in sync contexts
        without fighting the running event loop (e.g., LangGraph nodes).
        """
        if not self.api_key:
            return {"status": "error", "message": "NEWS_API_KEY not configured", "articles": []}

        if not from_date:
            from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

        params = {
            "q": query,
            "page": page,
            "pageSize": min(page_size, 100),
            "sortBy": sort_by,
            "from": from_date,
            "language": language,
        }
        if to_date:
            params["to"] = to_date

        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.BASE_URL}/everything",
                    headers=self.headers,
                    params=params,
                    timeout=30.0,
                )

            if response.status_code == 200:
                return response.json()

            error_data = response.json()
            return {
                "status": "error",
                "message": error_data.get("message", f"HTTP {response.status_code}"),
                "articles": [],
            }
        except Exception as e:
            return {"status": "error", "message": str(e), "articles": []}
    
    async def get_top_headlines(
        self,
        category: Optional[str] = None,
        country: str = "us",
        query: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> dict:
        """
        Get top headlines for a country/category.
        
        Args:
            category: News category (business, entertainment, general, 
                     health, science, sports, technology)
            country: 2-letter country code (us, in, gb, etc.)
            query: Optional search query within headlines
            page: Page number
            page_size: Number of results per page
        
        Returns:
            dict with status, totalResults, and articles
        """
        if not self.api_key:
            return {"status": "error", "message": "NEWS_API_KEY not configured", "articles": []}
        
        # Map our categories to NewsAPI categories
        category_mapping = {
            "technology": "technology",
            "tech": "technology",
            "ai": "technology",
            "gaming": "technology",
            "business": "business",
            "finance": "business",
            "startups": "business",
            "crypto": "business",
            "real estate": "business",
            "retail": "business",
            "manufacturing": "business",
            "science": "science",
            "space": "science",
            "environment": "science",
            "climate": "science",
            "health": "health",
            "medicine": "health",
            "entertainment": "entertainment",
            "music": "entertainment",
            "art": "entertainment",
            "fashion": "entertainment",
            "sports": "sports",
            "politics": "general",
            "world": "general",
            "education": "general",
            "travel": "general",
            "food": "general",
            "law": "general",
            "energy": "general",
            "agriculture": "general",
            "automotive": "general"
        }
        
        params = {
            "country": country,
            "page": page,
            "pageSize": min(page_size, 100)
        }
        
        if category:
            normalized_category = category.lower()
            api_category = category_mapping.get(normalized_category, "general")
            params["category"] = api_category
        
        if query:
            params["q"] = query
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/top-headlines",
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_data = response.json()
                    return {
                        "status": "error",
                        "message": error_data.get("message", f"HTTP {response.status_code}"),
                        "articles": []
                    }
        except Exception as e:
            return {"status": "error", "message": str(e), "articles": []}
    
    async def get_sources(
        self,
        category: Optional[str] = None,
        language: str = "en",
        country: Optional[str] = None
    ) -> dict:
        """
        Get available news sources.
        
        Args:
            category: Filter by category
            language: Filter by language
            country: Filter by country
        
        Returns:
            dict with status and sources list
        """
        if not self.api_key:
            return {"status": "error", "message": "NEWS_API_KEY not configured", "sources": []}
        
        params = {"language": language}
        
        if category:
            params["category"] = category.lower()
        if country:
            params["country"] = country.lower()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/top-headlines/sources",
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_data = response.json()
                    return {
                        "status": "error",
                        "message": error_data.get("message", f"HTTP {response.status_code}"),
                        "sources": []
                    }
        except Exception as e:
            return {"status": "error", "message": str(e), "sources": []}
    
    def format_articles(self, articles: List[dict], category: str = "General") -> List[dict]:
        """
        Format NewsAPI articles to match our standard format.
        
        Args:
            articles: Raw articles from NewsAPI
            category: Category to assign
        
        Returns:
            List of formatted article dictionaries
        """
        formatted = []
        for i, article in enumerate(articles):
            formatted.append({
                "id": f"news_{i}",
                "title": article.get("title", "Untitled"),
                "summary": article.get("description") or article.get("content", "")[:200],
                "source": article.get("source", {}).get("name", "Unknown"),
                "url": article.get("url", "#"),
                "image_url": article.get("urlToImage"),
                "category": category,
                "published_at": article.get("publishedAt", ""),
                "author": article.get("author"),
                "content": article.get("content", "")
            })
        return formatted


# Singleton instance
news_api_service = NewsAPIService()
