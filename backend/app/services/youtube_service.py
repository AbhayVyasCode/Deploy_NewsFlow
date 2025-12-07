"""
YouTube API service for fetching news videos
"""
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.core.config import settings
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import asyncio
from concurrent.futures import ThreadPoolExecutor

_executor = ThreadPoolExecutor(max_workers=2)


def _fetch_youtube_videos_sync(query: str, max_results: int = 15) -> List[Dict]:
    """
    Synchronous function to fetch YouTube videos
    """
    if not settings.YOUTUBE_API_KEY:
        print("Warning: YOUTUBE_API_KEY not configured")
        return []
    
    try:
        youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
        
        # Calculate date for recent videos (last 7 days)
        published_after = (datetime.utcnow() - timedelta(days=7)).isoformat() + 'Z'
        
        # Search for news videos
        search_response = youtube.search().list(
            q=query,
            part='id,snippet',
            maxResults=max_results,
            type='video',
            order='date',  # Most recent first
            publishedAfter=published_after,
            relevanceLanguage='en',
            safeSearch='moderate',
            videoDuration='medium',  # 4-20 minutes
            videoDefinition='high'
        ).execute()
        
        videos = []
        for item in search_response.get('items', []):
            video_id = item['id'].get('videoId')
            if not video_id:
                continue
                
            snippet = item['snippet']
            
            # Get video statistics
            try:
                video_response = youtube.videos().list(
                    part='statistics,contentDetails',
                    id=video_id
                ).execute()
                
                stats = video_response['items'][0]['statistics'] if video_response.get('items') else {}
                view_count = int(stats.get('viewCount', 0))
            except:
                view_count = 0
            
            videos.append({
                'id': f"yt_{video_id}",
                'title': snippet.get('title', 'Untitled'),
                'summary': snippet.get('description', '')[:300],
                'source': snippet.get('channelTitle', 'YouTube'),
                'url': f"https://www.youtube.com/watch?v={video_id}",
                'image_url': snippet.get('thumbnails', {}).get('high', {}).get('url') or 
                            snippet.get('thumbnails', {}).get('medium', {}).get('url'),
                'category': 'Video',
                'published_at': snippet.get('publishedAt', ''),
                'view_count': view_count,
                'channel_title': snippet.get('channelTitle', 'YouTube')
            })
        
        # Sort by view count for relevance
        videos.sort(key=lambda x: x.get('view_count', 0), reverse=True)
        return videos
        
    except HttpError as e:
        print(f"YouTube API error: {e}")
        return []
    except Exception as e:
        print(f"Error fetching YouTube videos: {e}")
        return []


async def fetch_youtube_videos(query: str, max_results: int = 15) -> List[Dict]:
    """
    Async wrapper for fetching YouTube videos
    """
    loop = asyncio.get_running_loop()
    videos = await loop.run_in_executor(_executor, _fetch_youtube_videos_sync, query, max_results)
    return videos


async def fetch_news_videos(categories: Optional[List[str]] = None, max_results: int = 15) -> List[Dict]:
    """
    Fetch latest news videos from YouTube
    """
    if categories and len(categories) > 0:
        # Build query from categories
        query = " OR ".join([f"{cat} news" for cat in categories[:3]])
    else:
        query = "latest news today"
    
    return await fetch_youtube_videos(query, max_results)


async def fetch_trending_news_videos(max_results: int = 15) -> List[Dict]:
    """
    Fetch trending news videos
    """
    return await fetch_youtube_videos("breaking news today", max_results)
