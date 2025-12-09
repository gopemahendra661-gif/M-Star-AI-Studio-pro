import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import LanguageSelector from './components/LanguageSelector';
import ResultCard from './components/ResultCard';
import PrivacyPolicy from './components/PrivacyPolicy';
import PermissionModal from './components/PermissionModal';
import { generateContent } from './services/openRouterService';
import { GeneratorMode, Language } from './types';

// Add type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [view, setView] = useState<'home' | 'privacy'>('home');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GeneratorMode>(GeneratorMode.AUTO);
  const [language, setLanguage] = useState<Language>('Hinglish');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const generatedItems = await generateContent(prompt, mode, language);
      setResults(generatedItems);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language based on selected language
    if (language === 'Hindi') {
      recognition.lang = 'hi-IN';
    } else if (language === 'English') {
      recognition.lang = 'en-US';
    } else {
      recognition.lang = 'en-IN'; // Works best for Hinglish/Indian accent
    }

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      
      // Handle Permission Errors
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'permission-denied') {
        setShowPermissionModal(true);
      } else if (event.error !== 'no-speech') {
        setError("Could not hear you. Please try again.");
        setTimeout(() => setError(null), 3000);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => {
        const newText = prev ? `${prev} ${transcript}` : transcript;
        return newText;
      });
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      // If start fails immediately, it might be a permission issue in some wrappers
      setShowPermissionModal(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col items-center">
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main className="w-full max-w-3xl flex-1 px-4 pb-20 mt-4">
          
          {view === 'privacy' ? (
            <PrivacyPolicy onBack={() => setView('home')} />
          ) : (
            <>
              {/* Input Section - Sticky Top below header */}
              <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-md pt-2 pb-2 transition-all duration-300">
                <ModeSelector currentMode={mode} onSelectMode={setMode} />
                <LanguageSelector currentLanguage={language} onSelectLanguage={setLanguage} />
                
                <div className="mt-2 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                  <div className="relative bg-white dark:bg-slate-900 rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-sm border border-slate-200 dark:border-transparent">
                    <div className="relative w-full">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            mode === GeneratorMode.AUTO ? `Type or speak in ${language}...` :
                            mode === GeneratorMode.ROAST ? `Who needs a roast? (${language})` :
                            mode === GeneratorMode.COMPLIMENT ? `Who to compliment? (${language})` :
                            mode === GeneratorMode.STYLISH_NAME ? "Enter name (e.g., 'Aditya')" :
                            `Enter your topic (${language})...`
                        }
                        className="w-full bg-transparent text-slate-900 dark:text-white p-3 pr-12 focus:outline-none resize-none h-14 md:h-auto overflow-hidden placeholder-slate-400 dark:placeholder-slate-500 rounded-lg"
                        rows={1}
                      />
                      
                      {/* Voice Input Button */}
                      <button
                        onClick={toggleListening}
                        className={`
                          absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300
                          ${isListening 
                            ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50' 
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }
                        `}
                        title="Voice Input"
                      >
                        {isListening ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                          </svg>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={loading || !prompt.trim()}
                      className={`
                        rounded-lg px-6 py-3 font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center min-w-[120px] h-14 md:h-auto
                        ${loading || !prompt.trim()
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95'
                        }
                      `}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'CREATE'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="mt-8 space-y-4">
                
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 dark:text-red-400 text-center animate-pulse">
                    {error}
                  </div>
                )}

                {results.length > 0 ? (
                  <div className="space-y-4 pb-12">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Generated Results</h2>
                      <span className="text-xs font-mono text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded">
                        {results.length} ITEMS
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {results.map((item, idx) => (
                          <ResultCard 
                            key={idx} 
                            content={item} 
                            index={idx} 
                          />
                        ))}
                    </div>
                  </div>
                ) : (
                  !loading && (
                    <div className="text-center mt-10 text-slate-600 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 dark:text-slate-400">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Ready to go viral?</p>
                      <p className="text-sm opacity-60 max-w-xs mx-auto mt-1 dark:text-slate-500">Select your language, choose a mode, and watch the magic happen.</p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </main>
        
        {/* Footer */}
        <footer className="fixed bottom-0 w-full bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 py-3 flex justify-center items-center gap-4 text-xs z-50">
          <span className="text-slate-500">M-STAR AI STUDIO</span>
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-700"></span>
          <button 
            onClick={() => setView('privacy')} 
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors uppercase font-medium tracking-wide"
          >
            Privacy Policy
          </button>
        </footer>

        {/* Permission Modal */}
        <PermissionModal 
          isOpen={showPermissionModal} 
          onClose={() => setShowPermissionModal(false)} 
        />
      </div>
    </div>
  );
};

export default App;