import React, { useState } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import LanguageSelector from './components/LanguageSelector';
import ResultCard from './components/ResultCard';
import { generateContent } from './services/openRouterService';
import { GeneratorMode, Language } from './types';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GeneratorMode>(GeneratorMode.AUTO);
  const [language, setLanguage] = useState<Language>('Hinglish');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <Header />

      <main className="w-full max-w-3xl flex-1 px-4 pb-20">
        
        {/* Input Section - Sticky Top below header */}
        <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md pt-2 pb-2 transition-all duration-300">
           <ModeSelector currentMode={mode} onSelectMode={setMode} />
           <LanguageSelector currentLanguage={language} onSelectLanguage={setLanguage} />
           
           <div className="mt-2 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500 blur-sm"></div>
            <div className="relative bg-slate-900 rounded-xl p-2 flex flex-col md:flex-row gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                    mode === GeneratorMode.AUTO ? `Type anything in ${language}...` :
                    mode === GeneratorMode.ROAST ? `Who needs a roast? (${language})` :
                    mode === GeneratorMode.COMPLIMENT ? `Who to compliment? (${language})` :
                    mode === GeneratorMode.STYLISH_NAME ? "Enter name (e.g., 'Aditya')" :
                    `Enter your topic (${language})...`
                }
                className="w-full bg-transparent text-white p-3 focus:outline-none resize-none h-14 md:h-auto overflow-hidden placeholder-slate-500"
                rows={1}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className={`
                  rounded-lg px-6 py-3 font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center min-w-[120px]
                  ${loading || !prompt.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center animate-pulse">
              {error}
            </div>
          )}

          {results.length > 0 ? (
            <div className="space-y-4 pb-12">
               <div className="flex items-center justify-between px-2 mb-2">
                 <h2 className="text-xl font-bold text-slate-200">Generated Results</h2>
                 <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-700 px-2 py-1 rounded">
                   {results.length} ITEMS
                 </span>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {results.map((item, idx) => (
                    <ResultCard key={idx} content={item} index={idx} />
                  ))}
               </div>
            </div>
          ) : (
            !loading && (
              <div className="text-center mt-10 text-slate-600 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="text-lg font-medium text-slate-400">Ready to go viral?</p>
                <p className="text-sm opacity-60 max-w-xs mx-auto mt-1">Select your language, choose a mode, and watch the magic happen.</p>
              </div>
            )
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur border-t border-slate-800 py-3 text-center text-slate-500 text-xs z-50">
        <p>POWERED BY OPENROUTER AI • M-STAR AI STUDIO</p>
      </footer>
    </div>
  );
};

export default App;