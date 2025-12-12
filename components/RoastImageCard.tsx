
import React, { useState, useEffect } from 'react';
import { generateRoastImage, shareRoastImage, downloadRoastImage } from '../utils/imageExporter';

interface RoastImageCardProps {
  content: string;
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: 'cosmic',
    name: 'Cosmic Vibe',
    containerClass: 'bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-500 text-white shadow-xl',
    textClass: 'font-bold drop-shadow-md',
    footerClass: 'text-white/80'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Roast',
    containerClass: 'bg-slate-950 border-4 border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.3)]',
    textClass: 'font-mono text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]',
    footerClass: 'text-green-600 font-mono tracking-widest'
  },
  {
    id: 'paper',
    name: 'Clean Paper',
    containerClass: 'bg-white border border-slate-200 text-slate-800 shadow-xl',
    textClass: 'font-serif italic font-semibold',
    footerClass: 'text-slate-400 uppercase tracking-widest text-[10px]'
  },
  {
    id: 'royal',
    name: 'Royal Luxury',
    containerClass: 'bg-slate-900 border-2 border-yellow-500/50 shadow-2xl',
    textClass: 'font-serif text-yellow-100 font-medium tracking-wide drop-shadow-md',
    footerClass: 'text-yellow-500/60 uppercase tracking-[0.2em] text-[10px]'
  },
  {
    id: 'brutalist',
    name: 'Brutalist Pop',
    containerClass: 'bg-[#ffde00] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black rounded-none',
    textClass: 'font-black uppercase tracking-tighter leading-tight',
    footerClass: 'text-black font-bold border-t-2 border-black pt-2 w-full text-center'
  },
  {
    id: 'sunset',
    name: 'Sunset Fade',
    containerClass: 'bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-700 text-white shadow-lg',
    textClass: 'font-sans font-bold italic drop-shadow-lg',
    footerClass: 'text-pink-200/50 font-medium'
  },
  {
    id: 'vintage',
    name: 'Vintage Note',
    containerClass: 'bg-[#f4f1ea] border border-[#dcd7c9] shadow-inner text-[#4a4a4a] bg-[radial-gradient(#e3e0d8_1px,transparent_1px)] [background-size:16px_16px]',
    textClass: 'font-serif font-medium leading-relaxed',
    footerClass: 'text-[#8c887d] italic text-xs'
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    containerClass: 'bg-gradient-to-tr from-[#0f172a] to-[#1e293b] border-t border-cyan-500/30 shadow-[0_10px_40px_-10px_rgba(6,182,212,0.3)]',
    textClass: 'text-cyan-50 font-light tracking-wide',
    footerClass: 'text-cyan-500/40 uppercase tracking-widest text-[9px]'
  }
];

const RoastImageCard: React.FC<RoastImageCardProps> = ({ content, onClose }) => {
  const [templateIndex, setTemplateIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideOverlay, setHideOverlay] = useState(false);

  const currentTemplate = TEMPLATES[templateIndex];

  // Auto-hide overlay text in fullscreen mode
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isFullscreen) {
      setHideOverlay(false);
      // Wait 2.5 seconds then fade out the text so user can take a clean screenshot
      timer = setTimeout(() => {
        setHideOverlay(true);
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  const handleGenerateAndAction = async (action: 'download' | 'share') => {
    setIsProcessing(true);
    
    try {
      // 1. Generate Image
      const { blob, dataUrl } = await generateRoastImage('roast-card-capture');
      
      // 2. Set Preview
      setGeneratedImage(dataUrl);

      // 3. Perform Action
      if (action === 'share') {
        if (blob) {
          const shared = await shareRoastImage(blob);
          if (!shared) {
            // Fallback if sharing is not supported/fails
            alert("Sharing not supported on this device. Downloading instead.");
            downloadRoastImage(dataUrl);
          }
        }
      } else if (action === 'download') {
        downloadRoastImage(dataUrl);
      }
      
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to create image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextTemplate = () => {
    setTemplateIndex((prev) => (prev + 1) % TEMPLATES.length);
    setGeneratedImage(null);
  };

  const resetView = () => {
    setGeneratedImage(null);
    setIsFullscreen(false);
  };

  // SCREENSHOT MODE RENDER
  if (isFullscreen && generatedImage) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-0 cursor-pointer"
        onClick={() => setIsFullscreen(false)} 
      >
        <img 
          src={generatedImage} 
          alt="Roast Fullscreen" 
          className="w-full max-w-lg h-auto object-contain pointer-events-none" 
        />
        
        {/* Floating Instructions that Fade Out */}
        <div className={`absolute inset-x-0 bottom-10 flex flex-col items-center pointer-events-none transition-opacity duration-700 ${hideOverlay ? 'opacity-0' : 'opacity-100'}`}>
          <div className="bg-black/60 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl border border-white/20 mb-2">
            Take Screenshot Now 📸
          </div>
          <div className="text-white/50 text-xs">
            (Text will disappear in a second)
          </div>
        </div>

        <div className={`absolute top-10 right-5 text-white/40 text-xs transition-opacity duration-700 ${hideOverlay ? 'opacity-0' : 'opacity-100'}`}>
          Tap image to close
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">Image Generator</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
          
          {generatedImage ? (
             <div className="flex flex-col items-center animate-fadeIn w-full">
                <img 
                  src={generatedImage} 
                  alt="Roast Card" 
                  className="w-full h-auto rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
                
                <p className="mt-4 text-xs text-center text-slate-500 font-medium">
                  Image generated successfully!
                </p>
                
                <div className="mt-3 w-full p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-300 text-center mb-2 font-semibold">
                    Download didn't start?
                  </p>
                  <button 
                    onClick={() => setIsFullscreen(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    Save via Screenshot (Easiest)
                  </button>
                </div>

                <button 
                  onClick={resetView}
                  className="mt-4 text-sm font-medium text-pink-600 hover:text-pink-700 underline"
                >
                  Edit / Change Template
                </button>
             </div>
          ) : (
            <div 
              id="roast-card-capture"
              // Removed shadow-xl from here, added to specific templates
              className={`
                relative w-full aspect-[4/5] p-8 flex flex-col justify-center items-center text-center rounded-xl transition-all duration-500
                ${currentTemplate.containerClass}
              `}
            >
              <div className="absolute top-4 left-0 right-0 flex justify-center opacity-80">
                 <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                   <span className="font-bold text-xs">M</span>
                 </div>
              </div>

              <div className="flex-1 flex items-center justify-center w-full">
                <p className={`text-2xl md:text-3xl leading-snug whitespace-pre-line ${currentTemplate.textClass}`}>
                  {content}
                </p>
              </div>

              <div className={`mt-6 text-xs font-semibold ${currentTemplate.footerClass}`}>
                M-STAR AI STUDIO
              </div>
            </div>
          )}

        </div>

        {/* Controls */}
        {!generatedImage && (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3">
            
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Style</span>
              <span className="text-xs text-slate-500">{currentTemplate.name}</span>
            </div>

            <button 
              onClick={nextTemplate}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
              Change Template
            </button>

            {/* SPLIT BUTTONS FOR SHARE AND DOWNLOAD */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleGenerateAndAction('share')}
                disabled={isProcessing}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? '...' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    Share
                  </>
                )}
              </button>

              <button 
                onClick={() => handleGenerateAndAction('download')}
                disabled={isProcessing}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? '...' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download
                  </>
                )}
              </button>
            </div>
            
          </div>
        )}

        {generatedImage && (
           <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl"
              >
                Close
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default RoastImageCard;
