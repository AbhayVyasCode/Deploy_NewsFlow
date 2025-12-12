import httpx
from bs4 import BeautifulSoup
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor

_executor = ThreadPoolExecutor(max_workers=3)

async def fetch_article_content(url: str) -> dict:
    """
    Fetches and extracts text content and title from a news article URL asynchronously.
    Returns a dict with 'title' and 'content'.
    """
    # 1. Try Direct Method with "Stealth" Headers
    try:
        # Full "Chrome on Windows" headers to look like a real user
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
        
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                response.raise_for_status()
                # Run CPU-bound extraction in thread pool
                loop = asyncio.get_running_loop()
                return await loop.run_in_executor(_executor, extract_content_from_html, response.content)
            except httpx.HTTPStatusError as e:
                print(f"Direct fetch failed: {e}")
                if e.response.status_code in [403, 401]:
                    print("Attempting fallback to Google Cache...")
                    return await fetch_from_google_cache(url, client)
                return None
            except httpx.RequestError as e:
                print(f"Request error occurred: {e}")
                return None

    except Exception as e:
        print(f"Error fetching article: {e}")
        return None

async def fetch_from_google_cache(url: str, client: httpx.AsyncClient) -> dict:
    """Fallback: Try to fetch the page from Google Cache"""
    try:
        # Google Cache URL format
        # Note: Google Cache strips some styling/scripts, which is actually good for us
        cache_url = f"http://webcache.googleusercontent.com/search?q=cache:{url}"
        
        # We still need headers, but maybe less strict ones for Google itself
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        
        response = await client.get(cache_url, headers=headers)
        if response.status_code != 200:
            print(f"Google Cache fetch failed with status: {response.status_code}")
            return None
            
        print("Successfully fetched from Google Cache")
        print("Successfully fetched from Google Cache")
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(_executor, extract_content_from_html, response.content)
    except Exception as e:
        print(f"Google Cache fallback error: {e}")
        return None

def extract_content_from_html(content: bytes) -> dict:
    """Shared extraction logic for both direct and cache fetch"""
    try:
        soup = BeautifulSoup(content, 'html.parser')

        # Extract title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        
        # Fallback for title
        if not title:
            og_title = soup.find("meta", property="og:title")
            if og_title:
                title = og_title.get("content", "").strip()

        # Remove Google Cache Header if present
        cache_header = soup.find(id="google-cache-hdr")
        if cache_header:
            cache_header.decompose()

        # Remove script, style, and noisy elements
        for element in soup(["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]):
            element.decompose()
            
        # Remove elements by class/id patterns common in sidebars/ads
        noisy_patterns = re.compile(r'sidebar|menu|nav|footer|header|ad-|social|comment|promoted|related', re.I)
        for element in soup.find_all(attrs={"class": noisy_patterns}):
            element.decompose()
        for element in soup.find_all(attrs={"id": noisy_patterns}):
            element.decompose()

        # Smart Text Extraction Strategy
        # 1. Try <article> tag first
        article_body = soup.find('article')
        
        # 2. If no article tag, try identifying main content area
        if not article_body:
            article_body = soup.find('main')
            
        # 3. If still nothing, look for common content class names
        if not article_body:
            for class_name in ['post-content', 'article-content', 'entry-content', 'content', 'story']:
                article_body = soup.find(class_=class_name)
                if article_body:
                    break
        
        # 4. Fallback to body if nothing else found
        if not article_body:
            article_body = soup.body

        if not article_body:
            return None

        # Get text with better spacing
        text = article_body.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Basic validation
        if len(text) < 200:
            print(f"Extracted content too short ({len(text)} chars). Likely failed.")
            return None

        return {"title": title, "content": text}
    except Exception as e:
        print(f"Extraction error: {e}")
        return None

