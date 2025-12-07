# Troubleshooting Guide

## Common Startup Errors

### Error: "Attribute 'app' not found in module 'app'"

**Problem**: Using wrong command `uvicorn app:app --reload`

**Solution**: Use the correct command:
```bash
# Correct ✅
uvicorn main:app --reload

# Wrong ❌
uvicorn app:app --reload
```

**Explanation**: 
- The main file is `main.py`, not `app.py`
- Format: `uvicorn <filename>:<variable> --reload`
- `main` = filename (main.py)
- `app` = FastAPI app variable inside main.py

### Error: "ModuleNotFoundError: No module named 'fastapi'"

**Problem**: Dependencies not installed

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

### Error: "Port 8000 is already in use"

**Problem**: Another process is using port 8000

**Solution 1**: Kill the existing process
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
uvicorn main:app --reload --port 8001
```

**Solution 2**: Use the batch file (it handles this)
```bash
.\start_server.bat
```

### Error: "GOOGLE_API_KEY not found"

**Problem**: Environment variables not configured

**Solution**:
```bash
# 1. Copy example env file
cp .env.example .env

# 2. Edit .env and add your API keys
# Use notepad, VS Code, or any editor
notepad .env

# 3. Add your keys:
GOOGLE_API_KEY=your_actual_key_here
YOUTUBE_API_KEY=your_actual_key_here
```

### Error: "Could not fetch article content"

**Problem**: Website blocking scraper or invalid URL

**Solution**:
- Try a different article URL
- Use mainstream news sites (BBC, CNN, etc.)
- Check if the URL is accessible in browser

### Error: "YouTube API key not configured"

**Problem**: Missing YouTube API key

**Solution**:
```bash
# 1. Get YouTube API key from Google Cloud Console
# 2. Add to backend/.env
YOUTUBE_API_KEY=your_youtube_key_here

# 3. Restart backend server
```

See `YOUTUBE_SETUP.md` for detailed instructions.

## Frontend Issues

### Error: "Cannot find module" or "Module not found"

**Problem**: Node dependencies not installed

**Solution**:
```bash
cd frontend
npm install
```

### Error: "Port 5173 already in use"

**Problem**: Another Vite dev server is running

**Solution**:
```bash
# Kill existing process or use different port
npm run dev -- --port 5174
```

### Error: "Network Error" or "Failed to fetch"

**Problem**: Backend not running or wrong API URL

**Solution**:
```bash
# 1. Check if backend is running
curl http://localhost:8000/health

# 2. If not, start backend
cd backend
uvicorn main:app --reload

# 3. Check frontend .env (if exists)
# Should have: VITE_API_URL=http://localhost:8000/api/v1
```

## API Issues

### Hindi News Not Showing

**Symptoms**: Empty results or English news

**Causes**:
1. DuckDuckGo rate limiting
2. Network issues
3. Search results vary

**Solutions**:
```bash
# Test the endpoint directly
curl http://localhost:8000/api/v1/news/hindi/trending

# Try refreshing after a few minutes
# Hindi news sources may have temporary issues
```

### Videos Not Loading

**Symptoms**: "YouTube API key not configured" or empty results

**Causes**:
1. Missing YouTube API key
2. API not enabled
3. Quota exceeded

**Solutions**:
```bash
# 1. Check if key is in .env
cat backend/.env | grep YOUTUBE

# 2. Verify API is enabled in Google Cloud Console
# Go to: APIs & Services → Library → YouTube Data API v3

# 3. Check quota
# Go to: APIs & Services → Quotas
# Should have 10,000 units/day

# 4. Test endpoint
curl http://localhost:8000/api/v1/news/videos/trending
```

### Summarization Fails

**Symptoms**: "Failed to summarize article"

**Causes**:
1. Invalid article URL
2. Gemini API key issue
3. Website blocking scraper

**Solutions**:
```bash
# 1. Test with a known good URL
curl -X POST http://localhost:8000/api/v1/news/summarize \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.bbc.com/news"}'

# 2. Check Gemini API key
# Verify at: https://ai.google.dev/

# 3. Check backend logs for detailed error
```

### Translation Not Working

**Symptoms**: "Failed to translate text"

**Causes**:
1. No text to translate
2. Gemini API issue

**Solutions**:
```bash
# 1. Ensure you have text (summarize first)
# 2. Test translation endpoint
curl -X POST http://localhost:8000/api/v1/news/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","target_language":"hi"}'

# Expected: Hindi translation
```

### Text-to-Speech Not Working

**Symptoms**: No audio or "Failed to generate speech"

**Causes**:
1. gTTS not installed
2. No text provided
3. Network issues

**Solutions**:
```bash
# 1. Install gTTS
pip install gTTS

# 2. Test TTS endpoint
curl -X POST http://localhost:8000/api/v1/news/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","language":"en"}' \
  --output test.mp3

# 3. Check if test.mp3 was created and plays
```

## Database Issues

### Supabase Connection Error

**Problem**: Cannot connect to Supabase

**Solution**:
```bash
# Supabase is optional for this app
# If not using, leave SUPABASE_URL and SUPABASE_KEY empty in .env

# If using Supabase:
# 1. Verify credentials at https://supabase.com
# 2. Check if project is active
# 3. Verify RLS policies are set up
```

## Performance Issues

### Slow Response Times

**Causes**:
1. AI API calls are slow
2. Web scraping takes time
3. No caching

**Solutions**:
```bash
# 1. Implement caching (see UPDATE_SUMMARY.md)
# 2. Reduce max_results parameter
# 3. Use faster news sources
```

### High Memory Usage

**Causes**:
1. Too many concurrent requests
2. Large article content
3. No cleanup

**Solutions**:
```bash
# 1. Limit concurrent requests
# 2. Truncate article content
# 3. Restart server periodically
```

## Development Issues

### Changes Not Reflecting

**Backend**:
```bash
# Ensure --reload flag is used
uvicorn main:app --reload

# Or restart manually
# Press Ctrl+C and restart
```

**Frontend**:
```bash
# Vite should auto-reload
# If not, try:
# 1. Clear browser cache (Ctrl+Shift+R)
# 2. Restart dev server
npm run dev
```

### Import Errors

**Problem**: "Cannot import name" or "ImportError"

**Solution**:
```bash
# 1. Check file paths
# 2. Verify __init__.py files exist
# 3. Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## Checking Logs

### Backend Logs

**View in terminal**: Logs appear in the terminal where uvicorn is running

**Common log patterns**:
```
INFO:     Application startup complete  # ✅ Good
ERROR:    Error loading ASGI app        # ❌ Check command
WARNING:  YOUTUBE_API_KEY not set       # ⚠️  Add API key
```

### Frontend Logs

**Browser Console**: Press F12 → Console tab

**Common errors**:
```
Network Error                    # Backend not running
404 Not Found                    # Wrong API endpoint
CORS Error                       # CORS not configured (shouldn't happen)
```

## Testing Checklist

### Backend Health Check
```bash
# 1. Health endpoint
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# 2. API docs
# Open: http://localhost:8000/docs
# Should see Swagger UI

# 3. Test news search
curl http://localhost:8000/api/v1/news/search \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"technology","limit":5}'
```

### Frontend Health Check
```bash
# 1. Open browser
# Go to: http://localhost:5173

# 2. Check pages
# - Dashboard (/) - should load
# - Hindi (/hindi) - should show Hindi news
# - Videos (/videos) - should show YouTube videos
# - AI Tools (/tools) - should load

# 3. Test features
# - Click sparkle icon on news card
# - Try summarization
# - Try translation
# - Try text-to-speech
```

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Read error messages carefully
3. ✅ Check backend logs
4. ✅ Test API endpoints with curl
5. ✅ Verify environment variables
6. ✅ Check API quotas and limits

### Information to Provide

When reporting issues, include:
- Error message (full text)
- Backend logs
- Browser console errors
- Steps to reproduce
- Environment (OS, Python version, Node version)
- API keys status (configured or not)

### Useful Commands

```bash
# Check Python version
python --version

# Check Node version
node --version

# Check pip packages
pip list

# Check npm packages
npm list

# Check environment variables (Windows)
echo %GOOGLE_API_KEY%

# Check if port is in use (Windows)
netstat -ano | findstr :8000

# Test backend health
curl http://localhost:8000/health

# View backend logs
# Just look at the terminal where uvicorn is running
```

## Quick Fixes

### Nuclear Option: Fresh Start

If nothing works, try a complete reset:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Backend reset
cd backend
pip uninstall -y -r requirements.txt
pip install -r requirements.txt
rm -rf __pycache__ app/__pycache__

# 3. Frontend reset
cd frontend
rm -rf node_modules
npm install

# 4. Restart both
# Terminal 1:
cd backend
uvicorn main:app --reload

# Terminal 2:
cd frontend
npm run dev
```

### Environment Variable Issues

```bash
# Windows: Set temporarily
set GOOGLE_API_KEY=your_key_here
set YOUTUBE_API_KEY=your_key_here

# Then run
uvicorn main:app --reload

# Better: Use .env file
# Create backend/.env with your keys
```

## Still Having Issues?

1. Check documentation files:
   - `INSTALLATION.md` - Setup guide
   - `YOUTUBE_SETUP.md` - YouTube API setup
   - `HINDI_NEWS_SETUP.md` - Hindi news details
   - `UPDATE_SUMMARY.md` - Recent changes

2. Test individual components:
   - Test backend endpoints with curl
   - Test frontend pages individually
   - Check browser console for errors

3. Verify prerequisites:
   - Python 3.10+
   - Node.js 18+
   - All dependencies installed
   - API keys configured

4. Common mistakes:
   - Using `uvicorn app:app` instead of `uvicorn main:app`
   - Forgetting to add API keys to `.env`
   - Not restarting server after changes
   - Running commands in wrong directory
