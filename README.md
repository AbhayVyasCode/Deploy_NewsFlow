# NewsFlow - AI-Powered News Aggregator

A personalized news aggregator built with React, FastAPI, LangChain, LangGraph, and Google Gemini.

## Features

- 🔍 **Smart Search**: Search for news on any topic using AI-powered curation
- 📊 **30 Categories**: Browse trending news across 30 different categories
- 🤖 **AI Summarization**: News articles summarized by Gemini AI
- ⚡ **Real-time**: Live news from across the internet via DuckDuckGo
- 🎨 **Modern UI**: Beautiful, animated React frontend

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: FastAPI, Python
- **AI**: LangChain, LangGraph, Google Gemini 2.0 Flash
- **Search**: DuckDuckGo Search API (Free)
- **Database**: Supabase (Free Tier)

## Project Structure

```
Project1/
├── frontend/          # React Application
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── pages/        # Page Components
│   │   └── services/     # API Services
│   └── package.json
├── backend/           # FastAPI Application
│   ├── app/
│   │   ├── agents/       # LangGraph Workflows
│   │   ├── api/          # API Routes
│   │   ├── core/         # Config
│   │   └── models/       # Pydantic Models
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Step 1: Get Google API Key (Free)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

### Step 2: Create Supabase Project (Optional - Free)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon key

### Step 3: Configure Backend

1. Navigate to backend folder:

   ```bash
   cd backend
   ```

2. Create `.env` file:

   ```bash
   copy .env.example .env
   ```

3. Edit `.env` and add your API keys:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   NEWS_API_KEY=your_newsapi_key_here   # Optional: if missing we fall back to DuckDuckGo
   ```

### Step 4: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 5: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 6: Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Step 7: Access the Application

- **Frontend**: http://localhost:5173 (or next available port)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint                         | Description           |
| ------ | -------------------------------- | --------------------- |
| POST   | `/api/v1/news/search`            | Search for news       |
| GET    | `/api/v1/news/trends/{category}` | Get trending news     |
| GET    | `/api/v1/news/feed`              | Get personalized feed |
| GET    | `/api/v1/news/categories`        | List all categories   |

## Free Tier Limits

- **Google Gemini**: 15 RPM (requests per minute), 1M tokens/day
- **DuckDuckGo**: Unlimited (no API key needed)
- **Supabase**: 500MB database, 1GB bandwidth

## License

MIT
