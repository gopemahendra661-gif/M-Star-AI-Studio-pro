import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onSelectLanguage }) => {
  const languages: Language[] = ['Hinglish', 'Hindi', 'English'];

  return (
    <div className="flex justify-center space-x-3 py-3">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onSelectLanguage(lang)}
          className={`
            relative px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300
            ${
              currentLanguage === lang
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-105 ring-1 ring-white/20'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm dark:shadow-none'
            }
          `}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;