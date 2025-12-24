
import React, { useState, useEffect } from 'react';
import { getArchive, clearArchive } from '../services/storageService';
import { ForensicResult, View } from '../types';

interface ArchiveProps {
  setView?: (view: View) => void;
}

const Archive: React.FC<ArchiveProps> = ({ setView }) => {
  const [items, setItems] = useState<ForensicResult[]>([]);

  useEffect(() => {
    setItems(getArchive());
  }, []);

  const handleClear = () => {
    if (confirm("PURGE ALL SESSION DATA?")) {
      clearArchive();
      setItems([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="font-serif text-5xl md:text-7xl mb-6 uppercase tracking-tighter">Archive</h2>
          <p className="font-mono text-xs tracking-widest opacity-40 uppercase">Encrypted storage of session-derived visual artifacts.</p>
        </div>
        <button 
          onClick={handleClear}
          className="mb-2 font-mono text-[9px] border border-white/20 px-4 py-2 opacity-30 hover:opacity-100 transition-all uppercase tracking-widest glitch-hover"
        >
          [PURGE_ARCHIVE]
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-white/10">
          <p className="font-mono text-xs opacity-20 uppercase tracking-[0.5em]">No Data Cached In Current Cycle</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-white/30 transition-all group">
              <div className="flex justify-between font-mono text-[8px] opacity-30 uppercase tracking-tighter">
                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                <span>{item.type}</span>
              </div>
              
              <div className="aspect-square bg-black overflow-hidden relative cursor-pointer" onClick={() => setView?.(View.ANALYZE)}>
                {item.type === 'analysis' ? (
                  <div className="p-4 text-[10px] font-mono text-white/60 leading-relaxed overflow-hidden h-full italic">
                    {item.data}
                  </div>
                ) : (
                  <img src={item.data} className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" alt="Artifact" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase border border-white/40 px-5 py-2 bg-black glitch-hover shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                    INSPECT
                  </span>
                </div>
              </div>

              {item.prompt && (
                <p className="font-mono text-[9px] opacity-40 uppercase line-clamp-2 leading-relaxed tracking-wider italic">
                  "{item.prompt}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;
