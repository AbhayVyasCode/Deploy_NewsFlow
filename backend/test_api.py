from app.services.news_api import news_api_service

result = news_api_service.search_news_sync('technology', page_size=5)
print(f"Status: {result.get('status')}")
print(f"Articles: {len(result.get('articles', []))}")
if result.get('status') == 'error':
    print(f"Error: {result.get('message')}")
