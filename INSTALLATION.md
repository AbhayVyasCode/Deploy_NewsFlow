# Installation Guide - Complete Setup

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn
- Git

## Quick Start

### 1. Clone Repository (if applicable)
```bash
git clone <repository-url>
cd ai-news-agent
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

Required API keys in `.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
NEWS_API_KEY=your_newsapi_key_here  # Optional
```

#### Start Backend Server

**Option 1: Use the batch file (Windows)**
```bash
.\start_server.bat
```

**Option 2: Direct uvicorn command**
```bash
uvicorn main:app --reload
```

**Option 3: Python module**
```bash
python -m uvicorn main:app --reload
```

Backend will run on: `http://localhost:8000`

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment (if needed)
```bash
# Create .env file if custom API URL needed
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
```

#### Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Getting API Keys

### 1. Google Gemini API Key (Required)

**For AI Features: Summarization, Translation**

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste into `.env` as `GOOGLE_API_KEY`

**Free Tier**: 60 requests per minute

### 2. YouTube API Key (Required for Videos)

**For Video News Section**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy and paste into `.env` as `YOUTUBE_API_KEY`

**Free Tier**: 10,000 units/day (~87 video requests)

See `YOUTUBE_SETUP.md` for detailed instructions.

### 3. NewsAPI.org Key (Optional)

**For Additional News Sources**

1. Go to [NewsAPI.org](https://newsapi.org/)
2. Sign up for free account
3. Copy API key
4. Paste into `.env` as `NEWS_API_KEY`

**Free Tier**: 100 requests/day

## Verify Installation

### Test Backend
```bash
# Check health endpoint
curl http://localhost:8000/health

# Expected: {"status":"healthy"}
```

### Test Hindi News
```bash
curl http://localhost:8000/api/v1/news/hindi/trending

# Expected: JSON with Hindi news articles
```

### Test Videos
```bash
curl http://localhost:8000/api/v1/news/videos/trending

# Expected: JSON with YouTube videos
```

### Test Frontend
1. Open browser to `http://localhost:5173`
2. Should see NewsFlow homepage
3. Navigate to "Hindi" - should show Hindi news
4. Navigate to "Videos" - should show YouTube videos
5. Navigate to "AI Tools" - should work for summarization

## Common Issues

### Backend Won't Start

**Error**: `ModuleNotFoundError`
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Error**: `Port 8000 already in use`
```bash
# Solution: Use different port
uvicorn main:app --reload --port 8001
```

### Frontend Won't Start

**Error**: `Cannot find module`
```bash
# Solution: Install dependencies
npm install
```

**Error**: `Port 5173 already in use`
```bash
# Solution: Kill process or use different port
npm run dev -- --port 5174
```

### API Keys Not Working

**YouTube API Error**
```bash
# Check if API is enabled
# Go to Google Cloud Console → APIs & Services → Library
# Search "YouTube Data API v3" → Enable
```

**Gemini API Error**
```bash
# Verify API key is correct
# Check quota at https://ai.google.dev/
```

### Hindi News Not Showing

**Issue**: No results or English news
```bash
# This is normal - DuckDuckGo results vary
# Try refreshing or wait a few minutes
# Hindi news sources may have rate limits
```

### Videos Not Loading

**Issue**: "YouTube API key not configured"
```bash
# Add YOUTUBE_API_KEY to backend/.env
# Restart backend server
```

## Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Making Changes

**Backend Changes:**
- Edit Python files in `backend/app/`
- Server auto-reloads with `--reload` flag
- Check logs in terminal

**Frontend Changes:**
- Edit TypeScript/React files in `frontend/src/`
- Vite auto-reloads in browser
- Check browser console for errors

## Production Deployment

### Backend

```bash
# Install production dependencies
pip install -r requirements.txt

# Run with gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

```bash
# Build for production
npm run build

# Serve with nginx or any static server
# Built files are in frontend/dist/
```

### Environment Variables

**Production `.env`:**
```env
GOOGLE_API_KEY=your_production_key
YOUTUBE_API_KEY=your_production_key
NEWS_API_KEY=your_production_key

# Add production settings
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## Docker Setup (Optional)

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json .
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Testing

### Run Backend Tests
```bash
cd backend
python test_features.py
```

### Run Frontend Tests (if available)
```bash
cd frontend
npm test
```

## Updating

### Update Backend Dependencies
```bash
cd backend
pip install --upgrade -r requirements.txt
```

### Update Frontend Dependencies
```bash
cd frontend
npm update
```

## Support

### Documentation
- `README.md` - Project overview
- `FEATURES.md` - Feature list
- `USAGE_GUIDE.md` - User guide
- `YOUTUBE_SETUP.md` - YouTube API setup
- `HINDI_NEWS_SETUP.md` - Hindi news details
- `UPDATE_SUMMARY.md` - Recent changes

### Troubleshooting
1. Check backend logs
2. Check browser console
3. Verify API keys
4. Test endpoints with curl
5. Check API quotas

### Getting Help
- Check documentation files
- Review error messages
- Test individual components
- Verify environment variables

## Next Steps

After installation:
1. ✅ Test all features
2. ✅ Configure API keys
3. ✅ Customize settings
4. ✅ Deploy to production (optional)
5. ✅ Set up monitoring (optional)

Enjoy your AI News Agent! 🎉
