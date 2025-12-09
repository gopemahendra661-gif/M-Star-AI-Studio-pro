import React from 'react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl transform transition-all scale-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center mb-4 text-pink-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
              <line x1="22" y1="2" x2="2" y2="22" className="text-red-500"></line>
            </svg>
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Microphone Access Needed</h3>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
            The app cannot access your microphone. Please allow access to use Voice Input.
          </p>

          <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-left text-slate-600 dark:text-slate-300 mb-6 border border-slate-200 dark:border-slate-700/50">
            <p className="font-semibold mb-1 text-pink-500 dark:text-pink-400">How to fix:</p>
            <ul className="list-disc pl-4 space-y-1 opacity-90">
              <li>Check your browser address bar for a blocked camera/mic icon.</li>
              <li>Or go to <strong>Settings {'>'} Site Settings {'>'} Microphone</strong> and allow this site.</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            OK, I'll Check
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;