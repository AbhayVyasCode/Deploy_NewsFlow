import yt_dlp
import json

def get_transcript_ytdlp(url):
    print(f"Testing {url}")
    ydl_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en', 'hi'],
        'quiet': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.youtube.com/',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Check for subtitles
            subs = info.get('subtitles') or {}
            auto_subs = info.get('automatic_captions') or {}
            
            print(f"Title: {info.get('title')}")
            print(f"Manual available: {list(subs.keys())}")
            print(f"Auto available: {list(auto_subs.keys())}")
            
            # Logic to pick best
            # Prefer manual en/hi, then auto en/hi
            selected_sub = None
            for lang in ['en', 'hi']:
                if lang in subs:
                    selected_sub = subs[lang]
                    print(f"Selected Manual {lang}")
                    break
            
            if not selected_sub:
                for lang in ['en', 'hi']:
                     # yt-dlp sometimes uses 'en-orig' or 'en'
                    for k in auto_subs:
                        if k.startswith(lang):
                            selected_sub = auto_subs[k]
                            print(f"Selected Auto {k}")
                            break
                    if selected_sub: break
            
            if selected_sub:
                # selected_sub is a list of formats. We want 'json3' or 'vtt'
                # But we can't easily download from here without writing to disk usually, 
                # unless we fetch the 'url' from this dict.
                
                # Let's print the first format's URL to see if we can fetch it
                print(f"Subtitle URL: {selected_sub[0]['url']}")
                return selected_sub[0]['url']
            else:
                print("No suitable subtitles found.")
                return None

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    url = "https://www.youtube.com/watch?v=k3VqSaM6Xk8"
    get_transcript_ytdlp(url)
