
import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p < 100 ? p + 1 : 100));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white">
      <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden mb-4">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="font-mono text-[10px] tracking-[0.5em] uppercase animate-pulse">
        Initializing Engine — {progress}%
      </div>
    </div>
  );
};

export default LoadingScreen;
