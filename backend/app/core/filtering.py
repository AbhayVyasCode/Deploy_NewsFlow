from typing import List
from app.models.schemas import NewsItem
from urllib.parse import urlparse

# List of domains that are known to be paywalled, block scrapers, 
# or are video platforms not suitable for article summarization.
BLOCKED_DOMAINS = {
    # Paywalled / Subscription Required
    "wsj.com",
    "www.wsj.com",
    "bloomberg.com",
    "www.bloomberg.com",
    "nytimes.com",
    "www.nytimes.com",
    "ft.com",
    "www.ft.com",
    "economist.com",
    "www.economist.com",
    "washingtonpost.com",
    "www.washingtonpost.com",
    "thetimes.co.uk",
    "www.thetimes.co.uk",
    "hbr.org", 
    "www.hbr.org",
    "businessinsider.com", # Often paywalled/blocker
    "www.businessinsider.com",
    
    # Video Platforms (Not readable articles)
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "vimeo.com",
    "dailymotion.com",
    "twitch.tv"
}

def is_domain_accessible(url: str) -> bool:
    """Check if a URL is from an accessible domain."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Remove 'www.' prefix for simpler matching if desired, 
        # but exact matching against set is faster if we include strict variants.
        # Let's clean the domain to be safe.
        if domain.startswith("www."):
            root_domain = domain[4:]
        else:
            root_domain = domain
            
        # Check explicit blacklists
        if domain in BLOCKED_DOMAINS or root_domain in BLOCKED_DOMAINS:
            return False
            
        return True
    except:
        return False

def filter_accessible_items(items: List[NewsItem]) -> List[NewsItem]:
    """Filter out news items from blocked domains."""
    return [item for item in items if is_domain_accessible(item.url)]
