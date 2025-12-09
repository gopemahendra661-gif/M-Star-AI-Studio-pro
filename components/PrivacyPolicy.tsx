import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="w-full animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-sm font-medium text-pink-500 hover:text-pink-400 transition-colors group"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mr-2 transform group-hover:-translate-x-1 transition-transform"
        >
          <path d="M19 12H5m7 7-7-7 7-7"/>
        </svg>
        Back to Studio
      </button>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-slate-400 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">1. Introduction</h2>
            <p>
              Welcome to <strong>M-Star AI Studio</strong>. We value your trust and are committed to protecting your privacy. This policy outlines how we handle your data when you use our AI content generation services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">2. Data Collection</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>User Prompts:</strong> Text inputs and voice commands you provide are processed solely to generate content.
              </li>
              <li>
                <strong>Voice Data:</strong> If you use voice input, your browser's native Speech Recognition API processes the audio. We do not store any audio recordings.
              </li>
              <li>
                <strong>Usage Data:</strong> We may collect anonymous technical data (like browser type) to improve app performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">3. How We Use Data</h2>
            <p>
              We use your inputs strictly to generate the requested content (roasts, bios, captions, etc.). Your text prompts are sent to our AI providers (OpenRouter) to generate the response. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">4. Third-Party Services</h2>
            <p>We rely on the following services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>OpenRouter AI:</strong> For Large Language Model (LLM) processing.</li>
              <li><strong>Vercel:</strong> For hosting the application and serverless functions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">5. Data Retention</h2>
            <p>
              M-Star AI Studio is designed to be <strong>stateless</strong>. We do not permanently store your conversation history or generated results on our servers. Once you close the page, the data is cleared from your local view.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Last Updated: October 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;