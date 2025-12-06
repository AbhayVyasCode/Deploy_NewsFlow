import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "NewsFlow API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Google Gemini API
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # NewsAPI.org
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")
    
    # News Categories
    NEWS_CATEGORIES: list = [
        "Technology", "Business", "Science", "Health", "Entertainment",
        "Sports", "Politics", "World", "Environment", "Finance",
        "Education", "Travel", "Food", "Fashion", "Art",
        "Music", "Gaming", "Automotive", "Real Estate", "Startups",
        "Crypto", "AI", "Climate", "Space", "Medicine",
        "Law", "Energy", "Agriculture", "Retail", "Manufacturing"
    ]

settings = Settings()
