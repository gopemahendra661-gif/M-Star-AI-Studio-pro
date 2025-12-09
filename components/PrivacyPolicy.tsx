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
        className="mb-6 flex items-center text-sm font-medium text-pink-600 dark:text-pink-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors group"
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

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 mb-2">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-sm mb-6">Last Updated: October 2025</p>
        
        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
          <p>
            Welcome to <strong>M-Star AI Studio</strong>. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">1. Introduction</h2>
            <p>
              M-Star AI Studio is an AI-powered content generator that creates roasts, compliments, captions, stylish names, hashtags, and more. We only collect minimal information necessary for app functionality and we do not store or sell personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">2. Data We Collect</h2>
            
            <div className="ml-4 space-y-3">
              <div>
                <h3 className="text-slate-700 dark:text-slate-300 font-medium">a. User Prompts (Text Input)</h3>
                <ul className="list-disc pl-5 text-slate-600/90 dark:text-slate-400/90">
                  <li>Any text you enter is used only to generate AI responses.</li>
                  <li>No text is stored permanently on our servers.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-slate-700 dark:text-slate-300 font-medium">b. Voice Data</h3>
                <p>If you use voice input:</p>
                <ul className="list-disc pl-5 text-slate-600/90 dark:text-slate-400/90">
                  <li>Audio is processed by the device/browser's native Speech Recognition API.</li>
                  <li>We do not record, store, or transmit audio files.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-slate-700 dark:text-slate-300 font-medium">c. Technical / Usage Data (Anonymous)</h3>
                <p>We may collect non-identifiable data such as:</p>
                <ul className="list-disc pl-5 text-slate-600/90 dark:text-slate-400/90">
                  <li>Browser type</li>
                  <li>Device type</li>
                  <li>Performance metrics</li>
                </ul>
                <p className="mt-1">This helps us improve app functionality. No personal data is collected.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">3. How We Use Your Data</h2>
            <p>We use the data you provide only for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To generate AI responses (roasts, bios, captions, etc.)</li>
              <li>To improve app performance and user experience</li>
              <li>To ensure the app works smoothly on your device</li>
            </ul>
            <p className="mt-2">
              Your text prompts may be securely sent to our AI provider (OpenRouter) only to generate the requested output. 
              <strong> We do NOT sell, share, or use your data for marketing.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">4. Third-Party Services We Use</h2>
            <div className="ml-4 space-y-3">
              <div>
                <h3 className="text-slate-700 dark:text-slate-300 font-medium">a. OpenRouter AI</h3>
                <p>Used to process user prompts and generate AI responses.</p>
              </div>
              <div>
                <h3 className="text-slate-700 dark:text-slate-300 font-medium">b. Vercel</h3>
                <p>Used for hosting and running serverless functions.</p>
              </div>
              <p>These services may temporarily process your data only to fulfill the functionality of the app. They do not store your data permanently.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">5. Data Retention</h2>
            <p>M-Star AI Studio is designed to be <strong>stateless</strong>, meaning:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>We do not store your chat history</li>
              <li>We do not keep copies of your text or audio</li>
              <li>Data is processed in real time and then discarded</li>
              <li>Closing the app clears your local session</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">6. Permissions Used</h2>
            <h3 className="text-slate-700 dark:text-slate-300 font-medium">RECORD_AUDIO</h3>
            <p>Required only for voice input.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>We do not store audio</li>
              <li>We do not transmit your raw voice to any server</li>
              <li>Voice is processed locally by your device/browser</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">7. Children’s Privacy</h2>
            <p>
              Our app is not intended for children under 13. We do not knowingly collect personal data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">8. Security Measures</h2>
            <p>
              We use secure HTTPS/TLS encryption for all communication. We do not store any sensitive data, and therefore risk is minimized.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">9. Your Rights</h2>
            <p>Since we do not store personal data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>There is no data to access, delete, or modify</li>
              <li>You can stop using the app at any time</li>
              <li>Closing the app clears your session automatically</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, contact us at:</p>
            <div className="mt-2 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p><strong>Email:</strong> <a href="mailto:chillforai@gmail.com" className="text-pink-500 hover:underline">chillforai@gmail.com</a></p>
              <p className="mt-1"><strong>Developer:</strong> Mahendra Mirdha</p>
            </div>
          </section>

          <section className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              © 2025 M-Star AI Studio. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;