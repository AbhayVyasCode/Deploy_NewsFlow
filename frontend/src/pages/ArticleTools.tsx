import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors z-10 ${
        activeTab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {activeTab === id && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-primary/10 border-b-2 border-primary"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );

  return (
    <div className="min-h-screen p-6 pt-24 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-special">AI Article Tools</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform how you consume news with our suite of AI-powered tools.
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
           {/* URL Input Section */}
          <div className="p-8 border-b border-white/10 dark:border-white/5 bg-background/90 backdrop-blur-md">
            <label className="block text-sm font-semibold mb-3 text-foreground">Article URL</label>
            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste any article URL here (e.g., https://example.com/news-story)"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-input shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 dark:border-white/5 bg-secondary/80 backdrop-blur-sm">
            <TabButton id="summarize" label="Summarize" icon={FileText} />
            <TabButton id="translate" label="Translate" icon={Languages} />
            <TabButton id="speak" label="Smart Reader" icon={Volume2} />
          </div>

          {/* Content Area */}
          <div className="p-8 bg-background/80 min-h-[400px] backdrop-blur-md">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive"
                >
                  <div className="p-1 bg-destructive/20 rounded-full mt-0.5">
                     <Sparkles className="w-4 h-4 rotate-180" />
                  </div>
                  <p className="font-medium text-sm">{error}</p>
                </motion.div>
              )}

              {activeTab === 'summarize' && (
                <motion.div
                  key="summarize"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center justify-center gap-4 text-center py-8">
                     <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 mb-2">
                        <FileText className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-semibold text-foreground">Get the Gist Instantly</h3>
                     <p className="text-muted-foreground max-w-md">
                        Our AI analyzes the article and creates a concise, easy-to-read summary so you can stay informed in seconds.
                     </p>
                  </div>

                  <button
                    onClick={handleSummarize}
                    disabled={loading || !url}
                    className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Summary
                      </>
                    )}
                  </button>

                  {summary && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                        <h3 className="font-bold text-lg text-foreground line-clamp-1 pr-4">{articleTitle}</h3>
                        <button
                          onClick={() => copyToClipboard(summary)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg">{summary}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'translate' && (
                <motion.div
                  key="translate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                     <button
                        onClick={() => setTargetLanguage('hi')}
                        className={`p-4 rounded-xl border-2 transition-all font-semibold flex flex-col items-center gap-2 ${targetLanguage === 'hi' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-primary/50 text-muted-foreground'}`}
                     >
                        <span className="text-2xl">अ</span>
                        Hindi
                     </button>
                     <button
                         onClick={() => setTargetLanguage('en')}
                         className={`p-4 rounded-xl border-2 transition-all font-semibold flex flex-col items-center gap-2 ${targetLanguage === 'en' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-primary/50 text-muted-foreground'}`}
                     >
                        <span className="text-2xl">A</span>
                        English
                     </button>
                  </div>

                  <button
                    onClick={handleTranslate}
                    disabled={loading || (!summary && !translatedText)}
                    className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="w-5 h-5" />
                        Translate Content
                      </>
                    )}
                  </button>
                  {translatedText && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-foreground">Translation Result</h3>
                        <button
                          onClick={() => copyToClipboard(translatedText)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg">{translatedText}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'speak' && (
                <motion.div
                  key="speak"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                   <div className="flex justify-center gap-2 mb-4 bg-secondary/30 p-1 rounded-xl w-fit mx-auto">
                        <button
                        onClick={() => setSpeakLanguage('en')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${speakLanguage === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                        English Voice
                        </button>
                        <button
                        onClick={() => setSpeakLanguage('hi')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${speakLanguage === 'hi' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                        Hindi Voice
                        </button>
                    </div>

                  <textarea
                    value={textToSpeak}
                    onChange={(e) => setTextToSpeak(e.target.value)}
                    placeholder="Enter text to speak, or generate a summary first..."
                    className="w-full h-40 p-6 bg-card border border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground shadow-inner"
                  />
                  
                  <button
                    onClick={handleSpeak}
                    disabled={loading || isPlaying || (!textToSpeak && !translatedText && !summary)}
                    className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${
                        isPlaying 
                        ? 'bg-destructive text-destructive-foreground shadow-destructive/20 hover:bg-destructive/90' 
                        : 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading || isPlaying ? (
                      <>
                         {isPlaying ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                        {isPlaying ? 'Playing Audio...' : 'Generating Audio...'}
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        Read Aloud
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ArticleTools;
