# AI News Agent - Usage Guide

## Getting Started with New Features

### Quick Start

1. **Start the Backend Server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Open your browser to `http://localhost:5173`

## Using Article Enhancement Features

### Method 1: From News Cards (Quick Access)

1. Browse any news feed (Dashboard, Trends, Videos, etc.)
2. Find an article you want to enhance
3. Click the **sparkle icon (✨)** on the news card
4. The Article Enhancer modal will open with three tabs:
   - **Summarize**: Get AI-generated summary
   - **Translate**: Translate to Hindi/English
   - **Speak**: Listen to the content

### Method 2: AI Tools Page (Full Features)

1. Click **"AI Tools"** in the navigation bar
2. Paste any article URL in the input field
3. Use the three tabs to:
   - Generate summaries
   - Translate content
   - Listen to articles

## Feature Workflows

### Workflow 1: Summarize → Translate → Listen

1. **Summarize**
   - Enter article URL or click sparkle on news card
   - Click "Generate Summary"
   - Wait for AI to process (5-10 seconds)
   - Copy summary if needed

2. **Translate**
   - Switch to "Translate" tab
   - Select target language (Hindi or English)
   - Click "Translate to [Language]"
   - Copy translated text if needed

3. **Speak**
   - Switch to "Speak" tab
   - Select language for speech
   - Click "Speak Text"
   - Audio will play automatically

### Workflow 2: Direct Text-to-Speech

1. Go to AI Tools page
2. Switch to "Speak" tab
3. Enter or paste any text in the textarea
4. Select language (English or Hindi)
5. Click "Speak Text"
6. Listen to the audio

## Tips & Best Practices

### For Best Summarization Results
- Use complete article URLs (not shortened links)
- Works best with standard news websites
- May take 5-15 seconds depending on article length

### For Translation
- Summarize first for better context
- Translations preserve meaning and tone
- Works with both short and long texts

### For Text-to-Speech
- Keep text under 5000 characters for best performance
- Hindi TTS works best with Devanagari script
- Audio plays immediately after generation

## Troubleshooting

### "Could not fetch article content"
- Check if the URL is accessible
- Some websites block scraping
- Try a different article URL

### "Failed to summarize article"
- Ensure GOOGLE_API_KEY is set in backend/.env
- Check backend logs for errors
- Verify article content was fetched

### "Failed to translate text"
- Ensure you have summarized or entered text first
- Check GOOGLE_API_KEY configuration
- Try with shorter text

### "Failed to generate speech"
- Check if gTTS is installed: `pip install gTTS`
- Verify text is not empty
- Check backend logs for errors

## Keyboard Shortcuts

- **Esc**: Close Article Enhancer modal
- **Ctrl+C**: Copy text from summary/translation boxes

## Browser Compatibility

- Chrome/Edge: Full support ✅
- Firefox: Full support ✅
- Safari: Full support ✅
- Mobile browsers: Responsive design ✅

## Performance Notes

- **Summarization**: 5-15 seconds (depends on article length)
- **Translation**: 3-8 seconds (depends on text length)
- **Text-to-Speech**: 2-5 seconds (depends on text length)

## API Rate Limits

- Google Gemini API: Check your quota at Google AI Studio
- gTTS: No strict limits, but avoid excessive requests
- Web scraping: Respectful delays built-in

## Privacy & Data

- Article content is processed server-side
- No data is stored permanently
- Audio files are generated on-demand
- Translations are not cached

## Next Steps

- Explore different news categories
- Try translating articles to learn new languages
- Use TTS for hands-free news consumption
- Bookmark favorite summaries (coming soon)
