from dotenv import load_dotenv
import os

load_dotenv()
key = os.getenv("NEWS_API_KEY")
if key:
    print(f"NEWS_API_KEY is found: {key[:4]}...{key[-4:]}")
else:
    print("NEWS_API_KEY is NOT set.")
