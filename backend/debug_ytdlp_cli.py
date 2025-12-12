import subprocess
import json
import shutil

def test_cli(url):
    print(f"Testing CLI for {url}")
    
    # Check if yt-dlp is in path (it should be after pip install)
    yt_dlp_path = shutil.which('yt-dlp')
    if not yt_dlp_path:
        print("yt-dlp executable not found!")
        return

    cmd = [
        yt_dlp_path,
        url,
        '--dump-json',
        '--skip-download',
        '--write-auto-sub',
        '--sub-lang', 'en,hi'
    ]
    
    # cmd.extend(['--js-runtimes', f'node:{node_path}'])
    
    print(f"Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        
        if result.returncode != 0:
            print(f"Error (code {result.returncode}):")
            print(result.stderr)
            return

        # Parse JSON output
        info = json.loads(result.stdout)
        print(f"Title: {info.get('title')}")
        
        subs = info.get('subtitles') or {}
        auto_subs = info.get('automatic_captions') or {}
        
        print(f"Manual: {list(subs.keys())}")
        print(f"Auto: {list(auto_subs.keys())}")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    # NASA video, very public
    url = "https://www.youtube.com/watch?v=Hu4Ybm-pR7g"
    test_cli(url)
