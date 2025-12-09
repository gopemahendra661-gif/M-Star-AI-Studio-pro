import React, { useState } from 'react';

interface ResultCardProps {
  content: string;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ content, index }) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div 
      className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-300 animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p className="text-slate-200 text-lg font-medium leading-relaxed pr-2 pb-10 md:pb-0 md:pr-24">
        {content}
      </p>
      
      {/* Action Bar */}
      <div className="absolute bottom-3 right-3 flex items-center space-x-2 md:top-3 md:bottom-auto">
        
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-pink-600 hover:text-white transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
            p-2 rounded-lg transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100
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