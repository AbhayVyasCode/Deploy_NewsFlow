import requests
import json

# Test chat endpoint
response = requests.post(
    "http://localhost:8000/api/v1/news/chat",
    json={"message": "What's the latest in technology?", "history": []},
    timeout=30
)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Response: {data.get('response')[:200]}...")
    print(f"Sources: {data.get('sources', [])}")
else:
    print(f"Error: {response.text}")
