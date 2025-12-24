
import React, { useState, useEffect, useContext } from 'react';
import { generateImage } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';
import { saveResult } from '../services/storageService';
import { AuthContext } from '../App';
import { applyForensicWatermark } from '../utils/watermark';
import ErrorBanner from './ErrorBanner';
import FeatureLock from './FeatureLock';

const LOADING_STAGES = [
  "Initializing Neural Pathways",
  "Calibrating Latent Space",
  "Synthesizing Monochromatic Noise",
  "Iterative Denoising Sequence",
  "Harmonizing Contrast Ratios",
  "Finalizing Visual Matrix"
];

const GENERATOR_STATE_KEY = 'forensic_gen_v1';

const ImageGenerator: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<AspectRatio>('1:1');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem(GENERATOR_STATE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPrompt(data.prompt || '');
        setRatio(data.ratio || '1:1');
        setSize(data.size || '1K');
        setResult(data.result || null);
      } catch (e) {}
    }
    checkKeyStatus();
  }, []);

  // Save state
  useEffect(() => {
    const state = { prompt, ratio, size, result };
    localStorage.setItem(GENERATOR_STATE_KEY, JSON.stringify(state));
  }, [prompt, ratio, size, result]);

  const checkKeyStatus = async () => {
    try {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      setHasKey(ok);
    } catch (e) {
      setHasKey(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev;
          const inc = Math.random() * (prev > 80 ? 0.5 : 2);
          return Math.min(prev + inc, 99);
        });
        setCurrentStage(prev => {
          const next = Math.floor((progress / 100) * LOADING_STAGES.length);
          return Math.min(next, LOADING_STAGES.length - 1);
        });
      }, 150);
    } else {
      setProgress(0);
      setCurrentStage(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, progress]);

  const handleOpenKeyDialog = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
      setError(null);
    } catch (e) {
      setError("FAILED TO OPEN CREDENTIAL DIALOG");
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    try {
      let url = await generateImage(prompt, ratio, size);
      
      if (user?.isGuest) {
        url = await applyForensicWatermark(url, "UNAUTHORIZED_GENERATION_GUEST");
      }

      setResult(url);
      saveResult({
        type: 'generation',
        data: url,
        prompt: prompt,
        isWatermarked: user?.isGuest
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("api key")) {
        setHasKey(false);
        setError("CREDENTIAL ERROR: PLEASE SELECT A VALID PROJECT WITH BILLING ENABLED.");
      } else {
        setError(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasKey === null) return null;

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-4">
          <div className="w-16 h-16 border border-white mx-auto flex items-center justify-center mb-8 relative">
            <div className="w-2 h-2 bg-white animate-pulse"></div>
          </div>
          <h2 className="font-serif text-4xl uppercase tracking-widest">Node Credentials Required</h2>
          <p className="font-mono text-[10px] tracking-[0.4em] opacity-40 uppercase italic">External API Uplink Mandatory</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 max-w-lg mx-auto">
          <p className="font-mono text-[10px] opacity-60 uppercase leading-loose text-left">
            This module utilizes <span className="text-white">Gemini 3 Pro Image Preview</span> for high-compute synthesis. 
            As an open-source protocol, compute costs are distributed. You must provide your own API key.
          </p>
          <div className="flex flex-col gap-4">
            <button onClick={handleOpenKeyDialog} className="w-full py-5 bg-white text-black font-mono text-[11px] tracking-[0.5em] uppercase hover:bg-white/80 transition-all flex items-center justify-center gap-2">
              [Link Personal API Key]
            </button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="font-mono text-[8px] opacity-20 hover:opacity-100 transition-opacity uppercase tracking-widest underline decoration-white/20 underline-offset-4">Setup Instructions & Billing Docs</a>
          </div>
        </div>
        {error && <div className="max-w-lg mx-auto"><ErrorBanner message={error} /></div>}
      </div>
    );
  }

  return (
    <FeatureLock isLocked={!!user?.isGuest} label="Synthesizer">
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4 opacity-20">
             <span className="font-mono text-[8px] uppercase tracking-widest">Uplink: Personal_Key</span>
             <button onClick={() => setHasKey(false)} className="font-mono text-[8px] uppercase tracking-widest underline">[Switch Node]</button>
          </div>
          <h2 className="font-serif text-5xl md:text-7xl mb-6 uppercase tracking-tighter">Generator</h2>
          <p className="font-mono text-xs tracking-widest opacity-40 uppercase">Construct complex monochromatic structures using your personal compute budget.</p>
        </div>

        <ErrorBanner message={error} onClear={() => setError(null)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div>
              <label className="block font-mono text-[10px] tracking-widest opacity-40 mb-4 uppercase">Frame Geometry</label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => (
                  <button key={r} onClick={() => setRatio(r as AspectRatio)} className={`border border-white/20 py-2 font-mono text-[10px] transition-all uppercase tracking-tighter ${ratio === r ? 'bg-white text-black' : 'hover:border-white/60 text-white/40'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-widest opacity-40 mb-4 uppercase">Visual Density</label>
              <div className="grid grid-cols-3 gap-2">
                {['1K', '2K', '4K'].map(s => (
                  <button key={s} onClick={() => setSize(s as ImageSize)} className={`border border-white/20 py-2 font-mono text-[10px] transition-all uppercase ${size === s ? 'bg-white text-black' : 'hover:border-white/60 text-white/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-widest opacity-40 mb-4 uppercase">Semantic Input</label>
              <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="Enter descriptive parameters..." 
                className="w-full bg-transparent border border-white/20 p-4 font-mono text-xs focus:border-white outline-none transition-all h-32 resize-none placeholder:opacity-20 uppercase tracking-wider" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt} 
                className="w-full py-5 bg-white text-black font-mono text-xs tracking-[0.4em] uppercase hover:bg-white/80 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? 'Calculating...' : 'Execute Synthesis'}
              </button>
              <button onClick={() => {setResult(null); setPrompt('');}} className="font-mono text-[8px] opacity-20 hover:opacity-100 uppercase tracking-widest py-2 transition-all">[Clear Workspace]</button>
            </div>
          </div>

          <div className="lg:col-span-2 aspect-video bg-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden relative group">
            {result ? (
              <img src={result} alt="Generated" className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-1000" />
            ) : !isGenerating && (
              <div className="text-center opacity-10">
                <p className="font-mono text-xl tracking-[1em] uppercase">Ready</p>
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-full max-w-sm space-y-8 text-white">
                  <div className="space-y-2">
                    <div className="flex justify-between font-mono text-[9px] tracking-widest uppercase opacity-60">
                      <span>{LOADING_STAGES[currentStage]}</span>
                      <span>{Math.floor(progress)}%</span>
                    </div>
                    <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
                      <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureLock>
  );
};

export default ImageGenerator;
