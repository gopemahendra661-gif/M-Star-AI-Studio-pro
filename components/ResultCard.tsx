import React, { useState, useRef } from 'react';

interface ResultCardProps {
  content: string;
  index: number;
  isSaved?: boolean;
  onToggleSave?: (content: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ content, index, isSaved = false, onToggleSave }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'M-Star AI Content',
          text: content,
        });
      } catch (err) {
        console.log('Share skipped:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      // Use the local API route which proxies to StreamElements
      const response = await fetch(`/api/tts?text=${encodeURIComponent(content)}&voice=Aditi`);
      
      if (!response.ok) throw new Error("Audio fetch failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("TTS Error:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div 
      className="group relative bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-500/50 rounded-xl p-4 transition-all duration-300 animate-fadeIn shadow-sm hover:shadow-md dark:shadow-none"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p className="text-slate-800 dark:text-slate-200 text-lg font-medium leading-relaxed pr-2 pb-12 md:pb-0 md:pr-32 whitespace-pre-line">
        {content}
      </p>
      
      {/* Action Bar */}
      <div className="absolute bottom-3 right-3 flex items-center space-x-1 md:top-3 md:bottom-auto">
        
        {/* Play Audio Button */}
        <button
          onClick={handlePlayAudio}
          disabled={isLoadingAudio}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${isPlaying 
              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 animate-pulse' 
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-purple-600 hover:text-purple-600 dark:hover:text-white'
            }
          `}
          title="Listen"
        >
          {isLoadingAudio ? (
             <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>

        {/* Save/Heart Button */}
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(content)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isSaved
                ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400' 
                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-pink-100 dark:hover:bg-pink-600 hover:text-pink-600 dark:hover:text-white'
              }
            `}
            title={isSaved ? "Unsave" : "Save"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-600 hover:text-blue-600 dark:hover:text-white transition-all duration-200"
          title="Share"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${copied 
              ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' 
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-green-100 dark:hover:bg-green-600 hover:text-green-600 dark:hover:text-white'
            }
          `}
          title="Copy Text"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;