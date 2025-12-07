# AI News Agent - Complete Feature Set

## 🎯 Overview

AI-powered news aggregation platform with advanced features including article summarization, translation, text-to-speech, Hindi news, and YouTube video integration.

## ✨ Key Features

### 1. AI Article Enhancement
- **Summarization**: Generate concise AI summaries of any article
- **Translation**: Translate between Hindi and English
- **Text-to-Speech**: Listen to articles in multiple languages
- **Access**: Click sparkle icon (✨) on any news card or use AI Tools page

### 2. Hindi News Section
- **Authentic Hindi Content**: News in Devanagari script
- **Trusted Sources**: Dainik Bhaskar, Aaj Tak, Amar Ujala, and more
- **Latest Updates**: Trending Hindi news from India
- **No API Key Required**: Uses DuckDuckGo search

### 3. Video News Section
- **YouTube Integration**: Real news videos from YouTube
- **Recent Content**: Videos from last 7 days only
- **High Quality**: HD videos, 4-20 minutes duration
- **Trending First**: Sorted by views and relevance

### 4. Smart News Feed
- **AI-Powered Curation**: Gemini AI categorizes and analyzes news
- **Multiple Sources**: NewsAPI, DuckDuckGo, YouTube
- **Sentiment Analysis**: Positive, negative, neutral indicators
- **Category Filtering**: 30+ news categories

### 5. Interactive Features
- **Chat with AI**: Ask questions about news topics
- **Daily Digest**: Get personalized news summaries
- **Related Articles**: Find similar news stories
- **Search**: Powerful search across all sources

## 🚀 Quick Start

### Installation

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Required API Keys

1. **Google Gemini API** (Required)
   - Get from: https://ai.google.dev/
   - Used for: AI summarization, translation, curation

2. **YouTube API** (Required for videos)
   - Get from: https://console.cloud.google.com/
   - Used for: Video news section

3. **NewsAPI.org** (Optional)
   - Get from: https://newsapi.org/
   - Used for: Additional news sources

Add to `backend/.env`:
```env
GOOGLE_API_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

## 📱 Features by Section

### Dashboard (/)
- Personalized news feed
- Category filtering
- AI-curated articles
- Sentiment indicators

### Trends (/trends)
- Trending news by category
- Real-time updates
- Popular stories

### Videos (/videos)
- YouTube news videos
- Recent uploads only
- High-quality content
- Direct YouTube links

### Hindi (/hindi)
- Hindi language news
- Indian news sources
- Devanagari script
- Regional coverage

### AI Tools (/tools)
- Article summarization
- Text translation
- Text-to-speech
- Paste any URL

### Search (/search)
- Search all sources
- Advanced filters
- Category selection
- Date filtering

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI
- **AI**: Google Gemini 2.5 Flash
- **Search**: DuckDuckGo, NewsAPI, YouTube API
- **TTS**: Google Text-to-Speech (gTTS)
- **Scraping**: BeautifulSoup4, httpx

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v6

## 📊 API Endpoints

### News Endpoints
```bash
POST /api/v1/news/search          # Search news
GET  /api/v1/news/trends/{category}  # Get trends
GET  /api/v1/news/feed            # Personalized feed
GET  /api/v1/news/categories      # List categories
```

### AI Enhancement
```bash
POST /api/v1/news/summarize       # Summarize article
POST /api/v1/news/translate       # Translate text
POST /api/v1/news/speak           # Text-to-speech
```

### Hindi News
```bash
GET  /api/v1/news/hindi           # Get Hindi news
GET  /api/v1/news/hindi/trending  # Trending Hindi
```

### Video News
```bash
GET  /api/v1/news/videos          # Get videos
GET  /api/v1/news/videos/trending # Trending videos
GET  /api/v1/news/videos/category/{cat}  # By category
```

### AI Features
```bash
POST /api/v1/news/chat            # Chat with AI
POST /api/v1/news/digest          # Daily digest
GET  /api/v1/news/related/{query} # Related articles
```

## 📖 Documentation

- **INSTALLATION.md** - Complete setup guide
- **FEATURES.md** - Detailed feature documentation
- **USAGE_GUIDE.md** - User guide and workflows
- **YOUTUBE_SETUP.md** - YouTube API configuration
- **HINDI_NEWS_SETUP.md** - Hindi news details
- **UPDATE_SUMMARY.md** - Recent changes
- **QUICK_START.md** - Quick reference

## 🎨 UI Features

### Design
- Modern, clean interface
- Dark/light theme support
- Responsive design
- Smooth animations
- Intuitive navigation

### Components
- News cards with images
- Sentiment badges
- Category tags
- Loading states
- Error handling
- Modal dialogs

### Interactions
- Click sparkle for AI features
- Hover effects
- Smooth transitions
- Copy to clipboard
- Share buttons

## 🔧 Configuration

### Backend Config
```python
# backend/app/core/config.py
GOOGLE_API_KEY: str       # Gemini AI
YOUTUBE_API_KEY: str      # YouTube videos
NEWS_API_KEY: str         # NewsAPI (optional)
NEWS_CATEGORIES: list     # 30+ categories
```

### Frontend Config
```typescript
// frontend/src/services/api.ts
API_BASE_URL: string      # Backend URL
timeout: number           # Request timeout
```

## 🚦 Performance

### Response Times
- News search: 2-5 seconds
- Summarization: 5-15 seconds
- Translation: 3-8 seconds
- Text-to-speech: 2-5 seconds
- Video search: 3-7 seconds

### Optimization
- Async/await operations
- Lazy loading components
- Image optimization
- Request caching (recommended)
- Rate limiting

## 🔒 Security

### API Keys
- Stored in environment variables
- Never committed to git
- Server-side only
- Restricted by domain (production)

### Data Privacy
- No permanent storage
- Server-side processing
- No user tracking
- CORS configured

## 📈 Scalability

### Caching Strategy
```python
# Recommended: Redis caching
- News feed: 10 minutes
- Videos: 15 minutes
- Hindi news: 10 minutes
- Summaries: 1 hour
```

### Rate Limiting
```python
# Recommended limits
- Search: 60 requests/minute
- AI features: 20 requests/minute
- Videos: 10 requests/minute
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check Python version (3.10+)
- Install dependencies: `pip install -r requirements.txt`
- Verify .env file exists

**Frontend won't start**
- Check Node version (18+)
- Install dependencies: `npm install`
- Clear cache: `npm cache clean --force`

**No Hindi news**
- Normal - results vary
- Try refreshing
- Check backend logs

**No videos**
- Add YOUTUBE_API_KEY to .env
- Enable YouTube Data API v3
- Check quota limits

**AI features not working**
- Verify GOOGLE_API_KEY
- Check API quota
- Review backend logs

## 🎯 Use Cases

### For Readers
- Stay updated with latest news
- Read in preferred language
- Listen to articles hands-free
- Discover trending topics
- Watch news videos

### For Researchers
- Summarize long articles
- Translate foreign news
- Track sentiment trends
- Compare multiple sources
- Export summaries

### For Developers
- RESTful API
- Easy integration
- Comprehensive docs
- Example code
- Active development

## 🌟 Future Enhancements

### Planned Features
- [ ] More languages (Spanish, French, German)
- [ ] Video player embed
- [ ] Bookmark articles
- [ ] User accounts
- [ ] Email digests
- [ ] Mobile app
- [ ] Browser extension
- [ ] RSS feeds
- [ ] Podcast generation
- [ ] Social sharing

### Technical Improvements
- [ ] Redis caching
- [ ] WebSocket updates
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Performance monitoring

## 📝 License

[Your License Here]

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📧 Support

- Documentation: See docs folder
- Issues: GitHub Issues
- Email: [Your Email]
- Discord: [Your Discord]

## 🙏 Acknowledgments

- Google Gemini AI
- YouTube Data API
- NewsAPI.org
- DuckDuckGo Search
- Open source community

## 📊 Stats

- **30+** News categories
- **7** Hindi news sources
- **3** AI-powered features
- **10+** API endpoints
- **100%** TypeScript frontend
- **Async** Python backend

---

**Built with ❤️ using AI and modern web technologies**

For detailed setup instructions, see `INSTALLATION.md`
For feature documentation, see `FEATURES.md`
For usage guide, see `USAGE_GUIDE.md`
