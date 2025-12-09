import React from 'react';

interface HeaderProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="w-full py-6 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-slate-200 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700/50 relative transition-colors duration-300">
      
      {/* Theme Toggle Button */}
      {toggleTheme && (
        <button 
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            // Sun Icon for Dark Mode
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            // Moon Icon for Light Mode
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      )}

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