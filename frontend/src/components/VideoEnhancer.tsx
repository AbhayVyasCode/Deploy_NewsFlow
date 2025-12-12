import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Languages, Volume2, Loader2, Copy, Check, Youtube } from 'lucide-react';
import newsApi from '../services/api';

interface VideoEnhancerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
}

const VideoEnhancer = ({ isOpen, onClose, videoUrl, videoTitle }: VideoEnhancerProps) => {
  const [activeTab, setActiveTab] = useState<'summarize' | 'translate' | 'speak'>('summarize');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<'hi' | 'en'>('hi');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [speakLanguage, setSpeakLanguage] = useState<'hi' | 'en'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await newsApi.summarizeVideo(videoUrl);
      setSummary(response.summary);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to summarize video. Captions might be disabled.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!summary && !translatedText) {
      setError('Please summarize the video first or enter text to translate');
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600/10 to-pink-600/10 p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <Youtube className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-special">Video Enhancer</h2>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{videoTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-secondary/30">
            <button
              onClick={() => setActiveTab('summarize')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'summarize'
                  ? 'bg-card text-red-600 border-b-2 border-red-600'
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
                  ? 'bg-card text-red-600 border-b-2 border-red-600'
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
                  ? 'bg-card text-red-600 border-b-2 border-red-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              Speak
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {activeTab === 'summarize' && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Generate a concise summary of the video transcript using AI.
                </p>
                <button
                  onClick={handleSummarize}
                  disabled={loading}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Summarizing Video...
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
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Summary</h3>
                      <button
                        onClick={() => copyToClipboard(summary)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
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
                  Translate the video summary to Hindi or English.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTargetLanguage('hi')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      targetLanguage === 'hi'
                        ? 'bg-red-600 text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Hindi
                  </button>
                  <button
                    onClick={() => setTargetLanguage('en')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      targetLanguage === 'en'
                        ? 'bg-red-600 text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    English
                  </button>
                </div>
                <button
                  onClick={handleTranslate}
                  disabled={loading || (!summary && !translatedText)}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <div className="flex items-center justify-between mb-2">
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
                  Listen to the content using text-to-speech.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSpeakLanguage('en')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      speakLanguage === 'en'
                        ? 'bg-red-600 text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSpeakLanguage('hi')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      speakLanguage === 'hi'
                        ? 'bg-red-600 text-white'
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
                  className="w-full h-32 p-4 bg-secondary/50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  onClick={handleSpeak}
                  disabled={loading || isPlaying || (!textToSpeak && !translatedText && !summary)}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoEnhancer;
