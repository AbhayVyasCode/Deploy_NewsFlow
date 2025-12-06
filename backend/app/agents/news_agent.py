from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.tools import DuckDuckGoSearchResults
from app.core.config import settings
from app.services.news_api import news_api_service
import json
import operator
import asyncio
import re


class NewsAgentState(TypedDict):
    """State for the news aggregation agent"""
    query: str
    date: Optional[str]
    categories: List[str]
    raw_search_results: List[dict]
    curated_news: List[dict]
    final_news: Annotated[List[dict], operator.add]
    error: Optional[str]
    use_newsapi: bool  # Flag to use NewsAPI or DuckDuckGo


# Global agent instance (lazy initialization)
_news_agent = None


def get_news_agent():
    """Get or create the news agent (lazy initialization)"""
    global _news_agent
    if _news_agent is None:
        _news_agent = create_news_agent()
    return _news_agent


def get_llm():
    """Get Gemini LLM instance"""
    if not settings.GOOGLE_API_KEY:
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.3
    )


def detect_category_from_text(text: str, query: str = "", categories: List[str] = None) -> str:
    """Intelligently detect category from text content and query"""
    if not text:
        return "General"
    
    text_lower = (text + " " + query).lower()
    categories = categories or settings.NEWS_CATEGORIES
    
    # Category keyword mapping
    category_keywords = {
        "Technology": ["tech", "technology", "software", "hardware", "computer", "internet", "digital", "ai", "artificial intelligence", "machine learning", "coding", "programming", "app", "website"],
        "Space": ["space", "nasa", "astronaut", "rocket", "satellite", "mars", "moon", "planet", "galaxy", "solar system", "spacecraft", "orbit", "astronomy", "cosmic"],
        "Science": ["science", "research", "study", "scientist", "discovery", "experiment", "laboratory", "physics", "chemistry", "biology"],
        "Health": ["health", "medical", "doctor", "hospital", "disease", "treatment", "medicine", "patient", "healthcare", "wellness", "fitness"],
        "Business": ["business", "company", "corporate", "market", "economy", "financial", "trade", "commerce", "enterprise"],
        "Finance": ["finance", "money", "bank", "investment", "stock", "trading", "currency", "economy", "financial"],
        "Sports": ["sport", "football", "basketball", "soccer", "tennis", "olympics", "athlete", "game", "match", "championship"],
        "Entertainment": ["entertainment", "movie", "film", "tv", "television", "celebrity", "actor", "actress", "show", "series"],
        "Politics": ["politics", "political", "government", "president", "election", "vote", "senate", "congress", "policy"],
        "World": ["world", "international", "global", "country", "nation", "foreign"],
        "Environment": ["environment", "climate", "green", "pollution", "carbon", "emission", "renewable", "sustainability"],
        "Climate": ["climate", "weather", "temperature", "global warming", "greenhouse", "emission"],
        "AI": ["ai", "artificial intelligence", "machine learning", "neural network", "deep learning", "chatbot", "gpt"],
        "Gaming": ["gaming", "game", "video game", "gamer", "console", "playstation", "xbox", "nintendo"],
        "Automotive": ["car", "automotive", "vehicle", "automobile", "truck", "motor", "driving"],
        "Crypto": ["crypto", "cryptocurrency", "bitcoin", "blockchain", "ethereum", "nft"],
        "Medicine": ["medicine", "medical", "drug", "pharmaceutical", "treatment", "therapy"],
        "Energy": ["energy", "power", "electric", "solar", "wind", "nuclear", "oil", "gas"],
        "Education": ["education", "school", "university", "student", "teacher", "learning"],
        "Law": ["law", "legal", "court", "judge", "lawyer", "lawsuit", "justice"],
    }
    
    # Check for exact matches first
    for category in categories:
        if category.lower() in text_lower:
            return category
    
    # Check keyword matches
    best_match = "General"
    max_matches = 0
    
    for category, keywords in category_keywords.items():
        if category not in categories:
            continue
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        if matches > max_matches:
            max_matches = matches
            best_match = category
    
    return best_match if max_matches > 0 else "General"


def create_news_agent():
    """Create a LangGraph news aggregation workflow"""
    
    def search_news(state: NewsAgentState) -> NewsAgentState:
        """Search for news articles using NewsAPI.org"""
        try:
            query = state["query"].strip()
            categories = state.get("categories", [])
            use_newsapi = bool(settings.NEWS_API_KEY)
            
            # Enhance query if it's too short or generic
            if len(query) < 3:
                # If query is too short, use a default search
                query = "latest news"
            elif query.lower() in ["space", "tech", "ai", "health"]:
                # Add "news" to single-word queries to get better results
                query = f"{query} news"
            
            raw_results = []
            if use_newsapi:
                # Use NewsAPI.org when API key is available; use sync call to avoid
                # conflicting with the running FastAPI event loop.
                result = news_api_service.search_news_sync(
                    query=query,
                    page_size=15,
                    sort_by="publishedAt"
                )
                
                if result.get("status") == "ok":
                    articles = result.get("articles", [])
                    for article in articles:
                        raw_results.append({
                            "title": article.get("title", ""),
                            "snippet": article.get("description") or article.get("content", "")[:200],
                            "link": article.get("url", ""),
                            "source": article.get("source", {}).get("name", ""),
                            "image_url": article.get("urlToImage"),
                            "published_at": article.get("publishedAt", ""),
                            "author": article.get("author")
                        })
                else:
                    # If NewsAPI returns an error, fall back to DuckDuckGo
                    use_newsapi = False
            
            if not use_newsapi:
                # Fallback to DuckDuckGo when NEWS_API_KEY is missing or errored so the app still works
                # Use standard DuckDuckGo search to retrieve list of results
                from duckduckgo_search import DDGS

                try:
                    with DDGS() as ddgs:
                        # Use 'news' backend if possible, or 'text' with news keywords
                        results = list(ddgs.news(query, max_results=20))
                except Exception as e:
                    print(f"DuckDuckGo search error: {e}")
                    results = []

                for item in results:
                    # DDGS news results format:
                    # {'date': '2023-10...', 'title': '...', 'body': '...', 'url': '...', 'image': '...', 'source': '...'}
                    raw_results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("body", "") or item.get("snippet", ""),
                        "link": item.get("url", "") or item.get("link", ""),
                        "source": item.get("source", "Unknown"),
                        "image_url": item.get("image"),
                        "published_at": item.get("date", ""),
                        "author": item.get("source")
                    })
            
            return {**state, "raw_search_results": raw_results, "use_newsapi": use_newsapi}
        except Exception as e:
            return {**state, "error": str(e), "raw_search_results": [], "use_newsapi": bool(settings.NEWS_API_KEY)}
    
    def curate_news(state: NewsAgentState) -> NewsAgentState:
        """Use Gemini to curate, summarize, and analyze sentiment"""
        try:
            raw_results = state.get("raw_search_results", [])
            if not raw_results:
                return {**state, "curated_news": []}
            
            llm = get_llm()
            
            # If no API key, just pass through raw results with intelligent category detection
            if not llm:
                curated = []
                query = state.get("query", "")
                for item in raw_results:
                    title = item.get("title", "Untitled")
                    snippet = item.get("snippet", "")
                    combined_text = f"{title} {snippet}"
                    
                    # Detect category intelligently
                    detected_category = detect_category_from_text(
                        combined_text, 
                        query=query,
                        categories=state.get("categories") or settings.NEWS_CATEGORIES
                    )
                    
                    curated.append({
                        "title": title,
                        "summary": snippet,
                        "source": item.get("source", "Unknown"),
                        "url": item.get("link", "#"),
                        "image_url": item.get("image_url"),
                        "category": detected_category,
                        "sentiment": "neutral",
                        "sentiment_score": 0.0,
                        "published_at": item.get("published_at", ""),
                        "author": item.get("author")
                    })
                return {**state, "curated_news": curated}
            
            prompt = f"""You are a news curator and sentiment analyst. Given the following raw search results, 
            create a curated list of news items. For each item, provide:
            - title: A clear, engaging title (keep original if good)
            - summary: A 2-3 sentence summary
            - source: The source website
            - url: The article URL
            - image_url: The image URL if available
            - category: Best matching category from: {', '.join(settings.NEWS_CATEGORIES)}
            - sentiment: One of "positive", "negative", or "neutral"
            - sentiment_score: A number from -1.0 (very negative) to 1.0 (very positive)
            - published_at: Publication date
            - author: Article author if available
            
            Raw results:
            {json.dumps(raw_results, indent=2)}
            
            Return ONLY a valid JSON array of news items. No other text."""
            
            response = llm.invoke([
                SystemMessage(content="You are a news curator that outputs only valid JSON."),
                HumanMessage(content=prompt)
            ])
            
            # Parse response
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            curated = json.loads(content)
            
            # Ensure categories are properly assigned (fallback to detection if missing)
            query = state.get("query", "")
            for item in curated:
                if not item.get("category") or item.get("category") == "General":
                    combined_text = f"{item.get('title', '')} {item.get('summary', '')}"
                    item["category"] = detect_category_from_text(
                        combined_text,
                        query=query,
                        categories=settings.NEWS_CATEGORIES
                    )
            
            return {**state, "curated_news": curated}
        except Exception as e:
            # On error, pass through raw results with intelligent category detection
            curated = []
            query = state.get("query", "")
            for item in state.get("raw_search_results", []):
                title = item.get("title", "Untitled")
                snippet = item.get("snippet", "")
                combined_text = f"{title} {snippet}"
                
                detected_category = detect_category_from_text(
                    combined_text,
                    query=query,
                    categories=state.get("categories") or settings.NEWS_CATEGORIES
                )
                
                curated.append({
                    "title": title,
                    "summary": snippet,
                    "source": item.get("source", "Unknown"),
                    "url": item.get("link", "#"),
                    "image_url": item.get("image_url"),
                    "category": detected_category,
                    "sentiment": "neutral",
                    "sentiment_score": 0.0,
                    "published_at": item.get("published_at", ""),
                    "author": item.get("author")
                })
            return {**state, "curated_news": curated, "error": str(e)}
    
    def format_output(state: NewsAgentState) -> NewsAgentState:
        """Format the final news output"""
        curated = state.get("curated_news", [])
        final_news = []
        
        for i, item in enumerate(curated):
            final_news.append({
                "id": f"news_{i}",
                "title": item.get("title", "Untitled"),
                "summary": item.get("summary", ""),
                "source": item.get("source", "Unknown"),
                "url": item.get("url", "#"),
                "image_url": item.get("image_url"),
                "category": item.get("category", "General"),
                "published_at": item.get("published_at", state.get("date", "Today")),
                "sentiment": item.get("sentiment", "neutral"),
                "sentiment_score": item.get("sentiment_score", 0.0),
                "author": item.get("author")
            })
        
        return {**state, "final_news": final_news}
    
    # Build the graph
    workflow = StateGraph(NewsAgentState)
    
    # Add nodes
    workflow.add_node("search", search_news)
    workflow.add_node("curate", curate_news)
    workflow.add_node("format", format_output)
    
    # Add edges
    workflow.set_entry_point("search")
    workflow.add_edge("search", "curate")
    workflow.add_edge("curate", "format")
    workflow.add_edge("format", END)
    
    return workflow.compile()


async def search_news_async(query: str, categories: List[str] = None) -> List[dict]:
    """
    Async helper function to search news using NewsAPI directly.
    
    Args:
        query: Search query string
        categories: List of categories to filter by
    
    Returns:
        List of formatted news articles
    """
    result = await news_api_service.search_news(
        query=query,
        page_size=15,
        sort_by="publishedAt"
    )
    
    if result.get("status") == "ok":
        category = categories[0] if categories else "General"
        return news_api_service.format_articles(result.get("articles", []), category)
    
    return []


async def get_headlines_async(
    category: str = None,
    country: str = "us",
    page_size: int = 10
) -> List[dict]:
    """
    Async helper function to get top headlines.
    
    Args:
        category: Optional category filter
        country: Country code (default: us)
        page_size: Number of results
    
    Returns:
        List of formatted news articles
    """
    result = await news_api_service.get_top_headlines(
        category=category,
        country=country,
        page_size=page_size
    )
    
    if result.get("status") == "ok":
        return news_api_service.format_articles(
            result.get("articles", []),
            category or "General"
        )
    
    return []
