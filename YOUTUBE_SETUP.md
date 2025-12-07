# YouTube API Setup Guide

## Getting YouTube API Key

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "NewsFlow" (or any name)
5. Click "Create"

### Step 2: Enable YouTube Data API v3

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it
4. Click "Enable"

### Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Optional) Click "Restrict Key" to add restrictions:
   - Application restrictions: None (or HTTP referrers for production)
   - API restrictions: Select "YouTube Data API v3"
5. Click "Save"

### Step 4: Add to Environment Variables

Add to your `backend/.env` file:
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## API Quota Information

### Free Tier Limits
- **Daily Quota**: 10,000 units per day
- **Search Request Cost**: 100 units per request
- **Video Details Request**: 1 unit per request

### Quota Calculation
With default settings (15 videos per request):
- 1 search request = 100 units
- 15 video detail requests = 15 units
- **Total per request**: ~115 units
- **Daily requests possible**: ~87 requests/day

### Optimizing Quota Usage
1. Cache results when possible
2. Reduce `max_results` parameter
3. Implement request throttling
4. Use webhooks for updates instead of polling

## Testing the API

### Test YouTube Service
```python
# Run in Python console
import asyncio
from app.services.youtube_service import fetch_trending_news_videos

async def test():
    videos = await fetch_trending_news_videos(5)
    for video in videos:
        print(f"Title: {video['title']}")
        print(f"URL: {video['url']}")
        print(f"Views: {video['view_count']}")
        print("---")

asyncio.run(test())
```

### Test via API Endpoint
```bash
# Get trending videos
curl http://localhost:8000/api/v1/news/videos/trending

# Get videos by category
curl http://localhost:8000/api/v1/news/videos/category/Technology

# Search videos
curl "http://localhost:8000/api/v1/news/videos?query=AI+news&limit=10"
```

## Features

### Video Search Parameters
- **Query**: Search term (e.g., "latest news", "technology news")
- **Max Results**: Number of videos to return (default: 15)
- **Published After**: Only videos from last 7 days
- **Order**: Most recent first
- **Duration**: Medium length videos (4-20 minutes)
- **Quality**: High definition preferred

### Video Information Returned
- Video ID and URL
- Title and description
- Channel name
- Thumbnail image (high quality)
- Published date
- View count
- Category

## Troubleshooting

### "YouTube API key not configured"
- Check if `YOUTUBE_API_KEY` is set in `.env`
- Restart the backend server after adding the key

### "Quota exceeded"
- You've hit the daily limit of 10,000 units
- Wait until midnight Pacific Time for quota reset
- Consider requesting quota increase from Google

### "API key not valid"
- Verify the API key is correct
- Check if YouTube Data API v3 is enabled
- Ensure there are no extra spaces in the key

### No videos returned
- Check if the search query is too specific
- Verify internet connection
- Check backend logs for errors

## Production Considerations

### Security
1. **Restrict API Key**:
   - Add HTTP referrer restrictions
   - Limit to YouTube Data API v3 only
   - Regenerate key if exposed

2. **Rate Limiting**:
   - Implement request throttling
   - Cache results for 5-10 minutes
   - Use Redis for distributed caching

3. **Monitoring**:
   - Track quota usage
   - Set up alerts for quota limits
   - Log API errors

### Performance
1. **Caching Strategy**:
   ```python
   # Cache trending videos for 10 minutes
   from functools import lru_cache
   from datetime import datetime, timedelta
   
   cache_time = {}
   cache_data = {}
   
   async def get_cached_videos():
       if 'trending' in cache_time:
           if datetime.now() - cache_time['trending'] < timedelta(minutes=10):
               return cache_data['trending']
       
       videos = await fetch_trending_news_videos()
       cache_time['trending'] = datetime.now()
       cache_data['trending'] = videos
       return videos
   ```

2. **Batch Requests**:
   - Fetch multiple video details in one request
   - Use `videos().list()` with multiple IDs

3. **Async Processing**:
   - Already implemented with ThreadPoolExecutor
   - Non-blocking API calls

## Alternative: YouTube RSS Feeds

If you want to avoid API quota limits, you can use YouTube RSS feeds:

```python
import feedparser

def fetch_channel_videos(channel_id: str):
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    feed = feedparser.parse(url)
    
    videos = []
    for entry in feed.entries:
        videos.append({
            'title': entry.title,
            'url': entry.link,
            'published': entry.published,
            'thumbnail': entry.media_thumbnail[0]['url']
        })
    return videos
```

**Pros**: No API key needed, no quota limits
**Cons**: Limited data, no search functionality, only channel-specific

## Cost Optimization

### Free Tier Strategy
1. Cache aggressively (10-15 minutes)
2. Limit requests to 80/day
3. Use RSS feeds for known channels
4. Implement user-side caching

### Paid Tier
If you need more quota:
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Quotas"
3. Request quota increase
4. Costs: ~$0.20 per 1,000 additional units

## Support

For issues with YouTube API:
- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [Stack Overflow - YouTube API](https://stackoverflow.com/questions/tagged/youtube-api)
- [Google Cloud Support](https://cloud.google.com/support)
