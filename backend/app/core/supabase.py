from supabase import create_client, Client
from app.core.config import settings
import sys

def get_supabase() -> Client:
    """Get Supabase client instance"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        print("⚠️  Supabase credentials not found in .env file", file=sys.stderr)
        print(f"   SUPABASE_URL: {'✓ Set' if settings.SUPABASE_URL else '✗ Missing'}", file=sys.stderr)
        print(f"   SUPABASE_KEY: {'✓ Set' if settings.SUPABASE_KEY else '✗ Missing'}", file=sys.stderr)
        return None
    
    try:
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print(f"✓ Supabase is connected", file=sys.stderr)
        return client
    except Exception as e:
        print(f"✗ Failed to initialize Supabase client: {e}", file=sys.stderr)
        return None

supabase = get_supabase()
