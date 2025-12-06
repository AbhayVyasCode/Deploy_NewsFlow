from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: str
    image_url: Optional[str] = None
    category: str
    published_at: str
    sentiment: Optional[str] = None  # positive, negative, neutral
    sentiment_score: Optional[float] = None  # -1.0 to 1.0
    
class NewsSearchRequest(BaseModel):
    query: str
    date: Optional[str] = None
    categories: Optional[List[str]] = None
    limit: int = 25

class NewsSearchResponse(BaseModel):
    success: bool
    news: List[NewsItem]
    query: str
    total: int

class TrendsRequest(BaseModel):
    category: str
    limit: int = 25

class UserPreferences(BaseModel):
    user_id: str
    categories: List[str]
    keywords: Optional[List[str]] = None

class ChatMessage(BaseModel):
    role: str  # user or assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None

class DigestRequest(BaseModel):
    categories: Optional[List[str]] = None

class DigestResponse(BaseModel):
    digest: str
    headlines: List[str]
    generated_at: str

class SummarizeRequest(BaseModel):
    url: str

class SummarizeResponse(BaseModel):
    summary: str
    title: Optional[str] = None
    original_text: Optional[str] = None

class TranslateRequest(BaseModel):
    text: str
    target_language: str # 'hi' or 'en'

class TranslateResponse(BaseModel):
    translated_text: str
    source_language: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    language: str # 'hi' or 'en'
