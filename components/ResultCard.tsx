import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface ResultCardProps {
  content: string;
  index: number;
  language?: Language;
}

const ResultCard: React.FC<ResultCardProps> = ({ content, index, language = 'Hinglish' }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Determine Voice based on Language
  // Aditi is good for Hindi/Hinglish. Salli/Brian for English.
  const voiceName = language === 'English' ? 'Salli' : 'Aditi';
  
  // Use our local proxy API to avoid CORS issues
  const getAudioUrl = (text: string) => {
    // Basic cleanup to remove emojis as they might break TTS
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
    // Use window.location.origin to ensure absolute path if needed, or relative path
    return `/api/tts?voice=${voiceName}&text=${encodeURIComponent(cleanText)}`;
  };

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

  const toggleAudio = () => {
    if (!audioRef.current) {
      setAudioLoading(true);
      const audioUrl = getAudioUrl(content);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Better loading handling
      audio.onloadeddata = () => {
        setAudioLoading(false);
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(e => {
             console.error("Playback error", e);
             setIsPlaying(false);
             setAudioLoading(false);
          });
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = (e) => {
        console.error("Audio Load Error", e);
        setAudioLoading(false);
        setIsPlaying(false);
        alert("Audio unavailable. Trying fallback...");
        
        // Browser Native Fallback if API fails
        if ('speechSynthesis' in window) {
           const utterance = new SpeechSynthesisUtterance(content);
           utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
           window.speechSynthesis.speak(utterance);
        }
      };

      // Force load
      audio.load();
    } else {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.error(e));
        setIsPlaying(true);
      }
    }
  };

  const handleDownloadAudio = async () => {
    try {
      setAudioLoading(true);
      const url = getAudioUrl(content);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `m-star-audio-${index}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download audio. Check your connection.");
    } finally {
      setAudioLoading(false);
    }
  };

  const handleShareAudio = async () => {
    if (!navigator.share) {
      alert("Sharing not supported on this device. Try downloading instead.");
      return;
    }
    
    try {
      setAudioLoading(true);
      const url = getAudioUrl(content);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const file = new File([blob], "m-star-voice.mp3", { type: "audio/mp3" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'M-Star Audio',
          text: content
        });
      } else {
        throw new Error("Device does not support file sharing");
      }
    } catch (error) {
      console.error("Audio share failed", error);
      handleShare(); // Fallback to text share
    } finally {
      setAudioLoading(false);
    }
  };

  // Reset audio when content changes
  useEffect(() => {
    if(audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [content]);

  return (
    <div 
      className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-300 animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p className="text-slate-200 text-lg font-medium leading-relaxed pr-20 pb-8 md:pb-0">
        {content}
      </p>
      
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-700/30 md:border-0 md:mt-0 md:pt-0 md:absolute md:top-3 md:right-3 md:flex-row">
        
        {/* Play Button */}
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-lg transition-all duration-200 ${isPlaying ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700/50 text-slate-400 hover:bg-pink-600 hover:text-white'}`}
          title={isPlaying ? "Pause" : "Listen"}
        >
          {audioLoading ? (
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
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>

        {/* Download Audio */}
        <button
          onClick={handleDownloadAudio}
          className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-200 hidden group-hover:block md:hidden md:group-hover:block"
          title="Download Audio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>

         {/* Share Audio */}
         <button
          onClick={handleShareAudio}
          className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-green-600 hover:text-white transition-all duration-200 hidden group-hover:block md:hidden md:group-hover:block"
          title="Share Audio"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>

        {/* Share Text */}
        <button
          onClick={handleShare}
          className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-pink-600 hover:text-white transition-all duration-200"
          title="Share Text"
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
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-slate-700/50 text-slate-400 hover:bg-purple-600 hover:text-white'
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