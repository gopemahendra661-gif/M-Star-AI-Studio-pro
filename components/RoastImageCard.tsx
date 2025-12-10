import React, { useState } from 'react';
import { generateRoastImage, shareRoastImage, downloadRoastImage } from '../utils/imageExporter';

interface RoastImageCardProps {
  content: string;
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: 'cosmic',
    name: 'Cosmic Vibe',
    containerClass: 'bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-500 text-white',
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
  }
];

const RoastImageCard: React.FC<RoastImageCardProps> = ({ content, onClose }) => {
  const [templateIndex, setTemplateIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false); 

  const currentTemplate = TEMPLATES[templateIndex];

  const handleGenerateAndAction = async (action: 'download' | 'share' | 'preview') => {
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
            // Fallback: If share fails, trigger the server download so user can share from gallery
            downloadRoastImage(dataUrl);
            // alert("Saving to Gallery... You can share it from there!");
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
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-0"
        onClick={() => setIsFullscreen(false)} 
      >
        <img 
          src={generatedImage} 
          alt="Roast Fullscreen" 
          className="w-full max-w-lg h-auto object-contain pointer-events-none" 
        />
        <div className="absolute bottom-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm animate-pulse pointer-events-none">
          Take Screenshot Now 📸 • Tap to Exit
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
                  className="w-full h-auto rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
                  onClick={() => setIsFullscreen(true)}
                />
                
                <p className="mt-4 text-xs text-center text-green-600 dark:text-green-400 font-medium">
                  Image generated! Downloading should start automatically.
                </p>
                
                <button 
                    onClick={() => setIsFullscreen(true)}
                    className="mt-2 text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Still not working? Use Screenshot Mode
                  </button>

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
              className={`
                relative w-full aspect-[4/5] p-8 flex flex-col justify-center items-center text-center rounded-xl transition-all duration-500 shadow-xl
                ${currentTemplate.containerClass}
              `}
            >
              {/* Watermark / Logo */}
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

            <button 
              onClick={() => handleGenerateAndAction('download')}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? '...' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Generate & Download
                </>
              )}
            </button>
          </div>
        )}

        {generatedImage && (
           <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl"
              >
                Done
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default RoastImageCard;