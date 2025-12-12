from youtube_transcript_api import YouTubeTranscriptApi
import re
import asyncio

def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
        r'(?:embed\/)([0-9A-Za-z_-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return url if len(url) == 11 else None

def test_video(url, name):
    print(f"Testing {name}: {url}")
    video_id = extract_video_id(url)
    print(f"Extracted ID: {video_id}")
    
    if not video_id:
        print("FAILED: Could not extract ID")
        return

    try:
        # Inspect library
        print(f"Library methods: {dir(YouTubeTranscriptApi)}")
        
        # Try fetching using list_transcripts (robust method)
        print("\nFetching transcript using list_transcripts...")
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try manual hi/en
        try:
            transcript = transcript_list.find_manually_created_transcript(['hi', 'en'])
            print("Found MANUAL transcript")
        except:
            # Try auto
            try:
                transcript = transcript_list.find_generated_transcript(['hi', 'en'])
                print("Found GENERATED transcript")
            except:
                 transcript = next(iter(transcript_list))
                 print("Found FALLBACK transcript")

        fetched = transcript.fetch()
        print(f"SUCCESS! Transcript length: {len(fetched)} items")
        print(f"Preview: {fetched[0]['text']} {fetched[1]['text']}...")
        
    except Exception as e:
        print(f"ERROR: {e}")
    print("-" * 50)

if __name__ == "__main__":
    videos = [
        ("https://www.youtube.com/watch?v=k3VqSaM6Xk8", "TechCrunch (Likely has CC)"),
        ("https://www.youtube.com/watch?v=7ghhRHRP6t4", "Verge (Likely has CC)"),
        ("https://www.youtube.com/watch?v=jNQXAC9IVRw", "Old/Random Video (Might miss CC)") 
    ]
    
    for url, name in videos:
        test_video(url, name)
