import httpx
from bs4 import BeautifulSoup

async def fetch_article_content(url: str) -> dict:
    """
    Fetches and extracts text content and title from a news article URL asynchronously.
    Returns a dict with 'title' and 'content'.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                print(f"HTTP error occurred: {e}")
                return None
            except httpx.RequestError as e:
                print(f"Request error occurred: {e}")
                return None

            content = response.content

        soup = BeautifulSoup(content, 'html.parser')

        # Extract title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # Get text
        text = soup.get_text()

        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return {"title": title, "content": text}
    except Exception as e:
        print(f"Error fetching article: {e}")
        return None
