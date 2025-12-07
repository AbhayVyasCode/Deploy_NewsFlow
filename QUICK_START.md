# Quick Start Guide - AI Article Features

## 🚀 Start the Application

### 1. Backend
```bash
cd backend
uvicorn main:app --reload
```
Backend runs on: `http://localhost:8000`

### 2. Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

## ✨ Using the New Features

### Option 1: From Any News Card
1. Browse news on any page (Dashboard, Trends, etc.)
2. Click the **sparkle icon (✨)** on any article card
3. Modal opens with 3 tabs:
   - **Summarize**: Get AI summary
   - **Translate**: Translate to Hindi/English
   - **Speak**: Listen to the article

### Option 2: AI Tools Page
1. Click **"AI Tools"** in the navigation
2. Paste any article URL
3. Use the three tabs for enhancement

## 🎯 Quick Workflows

### Summarize an Article
1. Click sparkle icon or go to AI Tools
2. Click "Generate Summary"
3. Wait 5-10 seconds
4. Copy summary if needed

### Translate Content
1. Summarize first (or have text ready)
2. Go to "Translate" tab
3. Select Hindi or English
4. Click "Translate"
5. Copy translated text

### Listen to Article
1. Have summary or translated text ready
2. Go to "Speak" tab
3. Select language (English/Hindi)
4. Click "Speak Text"
5. Audio plays automatically

## 🔧 Requirements

### Backend Environment Variables
Create `backend/.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_newsapi_key_here
```

### Get API Keys
- **Google Gemini**: https://ai.google.dev/
- **NewsAPI**: https://newsapi.org/

## 🧪 Test the Features

Run the test script:
```bash
python test_features.py
```

## 📱 Features at a Glance

| Feature | Languages | Time | Access |
|---------|-----------|------|--------|
| Summarize | Any | 5-15s | Card/Tools |
| Translate | EN ↔ HI | 3-8s | Card/Tools |
| Speak | EN, HI | 2-5s | Card/Tools |

## 💡 Tips

- **Best URLs**: Standard news websites work best
- **Translation**: Summarize first for better context
- **Audio**: Keep text under 5000 characters
- **Copy**: Use copy button to save summaries

## ❓ Troubleshooting

**"Could not fetch article"**
→ Try a different URL or check if site blocks scraping

**"Failed to summarize"**
→ Check GOOGLE_API_KEY in backend/.env

**"No audio"**
→ Ensure gTTS is installed: `pip install gTTS`

## 📚 More Info

- **Full Features**: See `FEATURES.md`
- **Detailed Guide**: See `USAGE_GUIDE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

---

**Ready to go!** Start both servers and click the sparkle icon on any news card. 🎉
