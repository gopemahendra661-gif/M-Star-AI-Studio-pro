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

  return (
    <div 
      className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-300 animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p className="text-slate-200 text-lg font-medium leading-relaxed pr-10">
        {content}
      </p>
      
      <button
        onClick={handleCopy}
        className={`
          absolute top-3 right-3 p-2 rounded-lg transition-all duration-200
          ${copied 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-slate-700/50 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-purple-600 hover:text-white'
          }
        `}
        title="Copy to clipboard"
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
  );
};

export default ResultCard;
