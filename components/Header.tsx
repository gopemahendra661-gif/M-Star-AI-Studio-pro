import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-slate-200 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700/50 relative transition-colors duration-300">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-lg px-6 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tighter">
            M-STAR AI STUDIO
          </h1>
        </div>
      </div>
      <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium tracking-wide">
        VIRAL CONTENT ENGINE <span className="text-pink-500 mx-2">•</span> HINGLISH EDITION
      </p>
    </header>
  );
};

export default Header;