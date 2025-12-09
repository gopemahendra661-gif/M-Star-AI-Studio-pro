import React from 'react';
import { GeneratorMode } from '../types';

interface ModeSelectorProps {
  currentMode: GeneratorMode;
  onSelectMode: (mode: GeneratorMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  const modes = Object.values(GeneratorMode);

  return (
    <div className="w-full overflow-x-auto py-4 no-scrollbar">
      <div className="flex space-x-2 px-4 min-w-max mx-auto justify-center md:justify-center">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => onSelectMode(mode)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border
              ${
                currentMode === mode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/30 transform scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shadow-sm dark:shadow-none'
              }
            `}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;