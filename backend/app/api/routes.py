from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import (
    NewsSearchRequest, NewsSearchResponse, NewsItem, TrendsRequest, 
    UserPreferences, ChatRequest, ChatResponse, DigestRequest, DigestResponse,
    SummarizeRequest, SummarizeResponse, TranslateRequest, TranslateResponse, TTSRequest
)
from app.agents.news_agent import get_news_agent, get_llm
from app.agents.chat_agent import chat_with_news, generate_daily_digest
from app.core.config import settings
from app.core.supabase import supabase
from app.services.news_api import news_api_service
from app.services.scraper import fetch_article_content
from app.services.audio import text_to_speech
from typing import List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from fastapi.responses import StreamingResponse
import json

router = APIRouter()

@router.post("/search", response_model=NewsSearchResponse)
async def search_news(request: NewsSearchRequest):
    """Search for news based on query and optional filters"""
    try:
        news_agent = get_news_agent()
        
        initial_state = {
            "query": request.query,
            "date": request.date,
            "categories": request.categories or [],
            "raw_search_results": [],
            "curated_news": [],
            "final_news": [],
            "error": None
        }
        
        result = news_agent.invoke(initial_state)
        
        if result.get("error"):
            print(f"Agent error: {result['error']}")
        
        news_items = [NewsItem(**item) for item in result.get("final_news", [])]

        return NewsSearchResponse(
            success=True,
            news=news_items[:request.limit],
            query=request.query,
            total=len(news_items)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends/{category}")
async def get_trends(category: str, limit: int = 25):
    """Get trending news for a specific category"""
    try:
        if category not in settings.NEWS_CATEGORIES and category != "All":
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
        
        news_agent = get_news_agent()
        query = f"trending {category} news today" if category != "All" else "trending news today"
        
        initial_state = {
            "query": query,
            "date": None,
            "categories": [category] if category != "All" else [],
            "raw_search_results": [],
            "curated_news": [],
            "final_news": [],
            "error": None
        }
        
        result = news_agent.invoke(initial_state)
        news_items = [NewsItem(**item) for item in result.get("final_news", [])]
        
        return {
            "success": True,
            "category": category,
            "news": news_items[:limit],
            "total": len(news_items)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_article(request: SummarizeRequest):
    """Summarize a news article from a URL"""
    try:
        # Fetch content
        result = await fetch_article_content(request.url)
        if not result or not result.get("content"):
            raise HTTPException(status_code=400, detail="Could not fetch article content")

        content = result["content"]
        title = result.get("title", "")

        llm = get_llm()
        if not llm:
            raise HTTPException(status_code=500, detail="LLM service not available")

        # Summarize using LLM
        prompt = f"""Summarize the following article text into a concise and engaging summary (max 300 words).

        Article Title: {title}
        Article Text:
        {content[:10000]}  # Limit content to avoid token limits
        """

        response = await llm.ainvoke([
            SystemMessage(content="You are a helpful news summarizer."),
            HumanMessage(content=prompt)
        ])

        summary = response.content

        return SummarizeResponse(
            summary=summary,
            title=title,
            original_text=content[:500] + "..." # truncated
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """Translate text to target language"""
    try:
        llm = get_llm()
        if not llm:
            raise HTTPException(status_code=500, detail="LLM service not available")

        language_map = {
            "hi": "Hindi",
            "en": "English"
        }
        target_lang = language_map.get(request.target_language, "English")

        prompt = f"""Translate the following text to {target_lang}. Preserve the meaning and tone.

        Text:
        {request.text}
        """

        response = await llm.ainvoke([
            SystemMessage(content=f"You are a professional translator for {target_lang}."),
            HumanMessage(content=prompt)
        ])

        return TranslateResponse(
            translated_text=response.content,
            source_language="auto"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speak")
async def speak_text(request: TTSRequest):
    """Convert text to speech"""
    try:
        audio_stream = await text_to_speech(request.text, request.language)
        if not audio_stream:
            raise HTTPException(status_code=500, detail="Could not generate audio")

        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
async def get_categories():
    """Get all available news categories"""
    return {"categories": settings.NEWS_CATEGORIES}

@router.get("/feed")
async def get_personalized_feed(categories: str = "", limit: int = 25):
    """Get personalized news feed based on user preferences"""
    try:
        category_list = [c.strip() for c in categories.split(",") if c.strip()]
        
        if not category_list:
            category_list = ["Technology", "Science", "Business"]
        
        news_agent = get_news_agent()
        query = " OR ".join([f"{cat} news" for cat in category_list[:3]])
        
        initial_state = {
            "query": query,
            "date": None,
            "categories": category_list,
            "raw_search_results": [],
            "curated_news": [],
            "final_news": [],
            "error": None
        }
        
        result = news_agent.invoke(initial_state)
        news_items = [NewsItem(**item) for item in result.get("final_news", [])]
        
        return {
            "success": True,
            "news": news_items[:limit],
            "categories": category_list,
            "total": len(news_items)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preferences")
async def save_preferences(prefs: UserPreferences):
    """Save user preferences"""
    print(f"Preferences received for user {prefs.user_id}: {prefs.categories}")
    return {"success": True, "message": "Preferences saved locally"}

# ============ NEW AI FEATURES ============

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with AI about news topics"""
    try:
        history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
        result = await chat_with_news(request.message, history)
        return ChatResponse(
            response=result["response"],
            sources=result.get("sources", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/digest", response_model=DigestResponse)
async def get_digest(request: DigestRequest):
    """Generate daily news digest"""
    try:
        result = await generate_daily_digest(request.categories)
        return DigestResponse(
            digest=result["digest"],
            headlines=result.get("headlines", []),
            generated_at=result.get("generated_at", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/related/{query}")
async def get_related(query: str, limit: int = 5):
    """Get related articles based on a topic"""
    try:
        news_agent = get_news_agent()
        
        initial_state = {
            "query": f"related to {query}",
            "date": None,
            "categories": [],
            "raw_search_results": [],
            "curated_news": [],
            "final_news": [],
            "error": None
        }
        
        result = news_agent.invoke(initial_state)
        news_items = [NewsItem(**item) for item in result.get("final_news", [])]
        
        return {
            "success": True,
            "related": news_items[:limit],
            "query": query
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ NEWSAPI.ORG DIRECT ENDPOINTS ============

@router.get("/headlines")
async def get_headlines(
    category: str = None,
    country: str = "us",
    limit: int = 10
):
    """Get top headlines from NewsAPI.org"""
    try:
        result = await news_api_service.get_top_headlines(
            category=category,
            country=country,
            page_size=limit
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        articles = news_api_service.format_articles(
            result.get("articles", []),
            category or "General"
        )
        
        return {
            "success": True,
            "headlines": articles,
            "category": category,
            "country": country,
            "total": len(articles)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources")
async def get_sources(
    category: str = None,
    language: str = "en",
    country: str = None
):
    """Get available news sources from NewsAPI.org"""
    try:
        result = await news_api_service.get_sources(
            category=category,
            language=language,
            country=country
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return {
            "success": True,
            "sources": result.get("sources", []),
            "total": len(result.get("sources", []))
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

