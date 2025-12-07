"""
Test script for new AI News Agent features
Run this after starting the backend server
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1/news"

def test_summarize():
    """Test article summarization"""
    print("\n=== Testing Article Summarization ===")
    url = "https://www.bbc.com/news/technology"
    
    response = requests.post(
        f"{BASE_URL}/summarize",
        json={"url": url},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Summary generated successfully!")
        print(f"Title: {data.get('title', 'N/A')}")
        print(f"Summary: {data.get('summary', 'N/A')[:200]}...")
        return data.get('summary', '')
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def test_translate(text):
    """Test translation"""
    print("\n=== Testing Translation ===")
    
    if not text:
        print("⚠️  No text to translate, skipping...")
        return None
    
    # Test English to Hindi
    response = requests.post(
        f"{BASE_URL}/translate",
        json={
            "text": text[:500],  # Limit text length
            "target_language": "hi"
        },
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Translation successful!")
        print(f"Translated (Hindi): {data.get('translated_text', 'N/A')[:200]}...")
        return data.get('translated_text', '')
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def test_speak(text):
    """Test text-to-speech"""
    print("\n=== Testing Text-to-Speech ===")
    
    if not text:
        text = "Hello, this is a test of the text to speech feature."
    
    response = requests.post(
        f"{BASE_URL}/speak",
        json={
            "text": text[:200],  # Limit text length
            "language": "en"
        },
        timeout=30
    )
    
    if response.status_code == 200:
        print(f"✅ Audio generated successfully!")
        print(f"Audio size: {len(response.content)} bytes")
        
        # Optionally save audio file
        with open("test_audio.mp3", "wb") as f:
            f.write(response.content)
        print("💾 Audio saved as test_audio.mp3")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Error: {response.text}")
        return False

def main():
    print("🚀 Starting AI News Agent Feature Tests")
    print("=" * 50)
    
    try:
        # Test 1: Summarization
        summary = test_summarize()
        
        # Test 2: Translation
        if summary:
            translated = test_translate(summary)
        
        # Test 3: Text-to-Speech
        test_speak("This is a test of the text to speech feature in English.")
        
        print("\n" + "=" * 50)
        print("✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to backend server")
        print("Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
