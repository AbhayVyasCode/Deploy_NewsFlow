import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Languages, Volume2, Loader2, Copy, Check, Link as LinkIcon, Sparkles } from 'lucide-react';
import newsApi from '../services/api';

const ArticleTools = () => {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'summarize' | 'translate' | 'speak'>('summarize');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<'hi' | 'en'>('hi');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [speakLanguage, setSpeakLanguage] = useState<'hi' | 'en'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!url) {
      setError('Please enter a valid article URL');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await newsApi.summarizeArticle(url);
      setSummary(response.summary);
      setArticleTitle(response.title || 'Article Summary');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to summarize article');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!summary && !translatedText) {
      setError('Please summarize the article first or enter text to translate');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const textToTranslate = summary || translatedText;
      const response = await newsApi.translateText(textToTranslate, targetLanguage);
      setTranslatedText(response.translated_text);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to translate text');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    const text = textToSpeak || translatedText || summary;
    if (!text) {
      setError('No text available to speak. Please summarize or translate first.');
      return;
    }
    setLoading(true);
    setError('');
    setIsPlaying(true);
    try {
      const audioBlob = await newsApi.speakText(text, speakLanguage);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate speech');
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">AI Article Tools</h1>
          </div>
          <p className="text-muted-foreground">
            Summarize, translate, and listen to any news article with AI-powered tools
          </p>
        </div>

        <div className="mb-6 p-6 bg-card rounded-xl border border-border shadow-sm">
          <label className="block text-sm font-medium mb-2">Article URL</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex border-b border-border bg-secondary/30 rounded-t-xl overflow-hidden">
          <button
            onClick={() => setActiveTab('summarize')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'summarize'
                ? 'bg-card text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            Summarize
          </button>
          <button
            onClick={() => setActiveTab('translate')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'translate'
                ? 'bg-card text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Languages className="w-4 h-4" />
            Translate
          </button>
          <button
            onClick={() => setActiveTab('speak')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'speak'
                ? 'bg-card text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Speak
          </button>
        </div>

        <div className="p-6 bg-card rounded-b-xl border border-t-0 border-border shadow-sm">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'summarize' && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Generate a concise summary of the article using AI. Enter the article URL above and click the button below.
              </p>
              <button
                onClick={handleSummarize}
                disabled={loading || !url}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Summary
                  </>
                )}
              </button>
              {summary && (
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{articleTitle}</h3>
                    <button
                      onClick={() => copyToClipboard(summary)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'translate' && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Translate the article summary to Hindi or English.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTargetLanguage('hi')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    targetLanguage === 'hi'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Hindi
                </button>
                <button
                  onClick={() => setTargetLanguage('en')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    targetLanguage === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  English
                </button>
              </div>
              <button
                onClick={handleTranslate}
                disabled={loading || (!summary && !translatedText)}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    Translate to {targetLanguage === 'hi' ? 'Hindi' : 'English'}
                  </>
                )}
              </button>
              {translatedText && (
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Translated Text</h3>
                    <button
                      onClick={() => copyToClipboard(translatedText)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'speak' && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Listen to the article content using text-to-speech.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSpeakLanguage('en')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    speakLanguage === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setSpeakLanguage('hi')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    speakLanguage === 'hi'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Hindi
                </button>
              </div>
              <textarea
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                placeholder="Enter text to speak or use summarized/translated text..."
                className="w-full h-32 p-4 bg-secondary/50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSpeak}
                disabled={loading || isPlaying || (!textToSpeak && !translatedText && !summary)}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading || isPlaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPlaying ? 'Playing...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    Speak Text
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ArticleTools;
