
import React from 'react';

interface ErrorBannerProps {
  message: string | null;
  onClear?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClear }) => {
  if (!message) return null;

  return (
    <div className="w-full bg-white/[0.03] border border-white/10 p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-4">
        <div className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center border border-white/40">
          <div className="w-1 h-1 bg-white animate-pulse"></div>
        </div>
        <div className="flex-grow">
          <h4 className="font-mono text-[10px] tracking-[0.2em] text-white/40 mb-1 uppercase">System Error Detected</h4>
          <p className="font-mono text-[11px] text-white/90 leading-relaxed uppercase tracking-wider">{message}</p>
        </div>
        {onClear && (
          <button 
            onClick={onClear}
            className="font-mono text-[10px] opacity-30 hover:opacity-100 transition-opacity uppercase px-2"
          >
            [Clear]
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
