
import React from 'react';
import { View } from '../types';

interface HeroProps {
  onStart: (view: View) => void;
}

const FEATURES = [
  { title: "EXIF DECODER", desc: "Extract hidden camera parameters and timestamps." },
  { title: "ELA ANALYSIS", desc: "Identify image manipulation via error levels." },
  { title: "ARTIFACT DETECTION", desc: "Detect AI-generated structures and pixel noise." },
  { title: "GEO PROFILING", desc: "Predict capture location through visual landmarks." },
  { title: "RGB ISOLATION", desc: "Separate color channels for deep inspection." },
  { title: "LUMINANCE MAPPING", desc: "Visualize light distribution and inconsistencies." }
];

const DiagnosticCorners = () => (
  <>
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40 group-hover:border-white transition-colors"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40 group-hover:border-white transition-colors"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40 group-hover:border-white transition-colors"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40 group-hover:border-white transition-colors"></div>
  </>
);

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="min-h-[90vh] flex flex-col py-12 select-none">
      {/* Main Branding Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-16 py-12">
        <div className="relative group">
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-1000">
            <h1 className="font-mono text-5xl md:text-8xl font-bold tracking-[0.5em] uppercase text-white transition-all group-hover:tracking-[0.6em] duration-700">
              PHOTO<br/>FORENSIC
            </h1>
            <div className="h-[1px] w-24 bg-white/40 mx-auto animate-pulse"></div>
          </div>
          
          {/* Visual Tech Overlays */}
          <div className="absolute -inset-10 border border-white/[0.03] -z-10 pointer-events-none"></div>
          <div className="absolute -inset-20 border border-white/[0.01] -z-10 pointer-events-none"></div>
        </div>

        <div className="max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] opacity-40 leading-relaxed uppercase max-w-lg mx-auto italic">
            Advanced digital asset investigation suite. 
            <br/>Neural reconstruction & highlight extraction.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <button 
              onClick={() => onStart(View.CONVERT)}
              className="group relative px-10 py-5 bg-white text-black font-mono text-[10px] tracking-[0.5em] uppercase transition-all duration-500 hover:bg-black hover:text-white border border-white overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute inset-0 border border-current opacity-20 rounded-full animate-ping"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
                <span>Enter Laboratory</span>
              </div>
              <div className="absolute inset-0 bg-white/5 -translate-y-full group-hover:animate-[scan_2s_linear_infinite] pointer-events-none opacity-0 group-hover:opacity-100"></div>
            </button>

            <button 
              onClick={() => onStart(View.ANALYZE)}
              className="group relative px-10 py-5 border border-white/10 font-mono text-[10px] tracking-[0.5em] uppercase hover:border-white hover:text-white transition-all duration-500 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center">
                <span className="opacity-60 group-hover:opacity-100">Inspector Mode</span>
                <span className="text-[7px] opacity-20 group-hover:opacity-40 tracking-widest mt-1">Status: Active_Uplink</span>
              </div>
              <DiagnosticCorners />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mt-32 border-t border-white/5 pt-24 pb-12">
        <div className="mb-20">
          <h2 className="font-mono text-[8px] tracking-[1.5em] opacity-20 uppercase text-center italic">Diagnostic Protocols</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="group relative pt-6 border-t border-white/5 hover:border-white/20 transition-all duration-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[9px] tracking-[0.3em] font-bold uppercase text-white/40 group-hover:text-white">
                    {feature.title}
                  </h3>
                  <span className="font-mono text-[7px] opacity-10">MOD_{idx + 22}</span>
                </div>
                <p className="font-mono text-[9px] opacity-20 leading-relaxed uppercase tracking-widest group-hover:opacity-40">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Establishment Guide (Installation) */}
      <div className="mt-32 border border-white/10 bg-white/[0.01] p-12 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-mono text-[10px] tracking-[0.8em] uppercase">Establish Local Node</h2>
          <p className="font-mono text-[7px] opacity-20 uppercase tracking-[0.3em]">Protocol v2.5 Deployment Manual</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="font-mono text-[9px] tracking-widest uppercase opacity-40 border-b border-white/5 pb-2">1. Shell Commands</h3>
            <div className="bg-black border border-white/5 p-6 font-mono text-[10px] leading-relaxed text-white/60 space-y-1">
              <p><span className="text-white/20">$</span> git clone https://github.com/shubham-chy/Photo-Forensic.git</p>
              <p><span className="text-white/20">$</span> cd Photo-Forensic</p>
              <p><span className="text-white/20">$</span> npm install</p>
              <p><span className="text-white/20">$</span> npm run dev</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-mono text-[9px] tracking-widest uppercase opacity-40 border-b border-white/5 pb-2">2. Environment Linkage</h3>
            <div className="bg-black border border-white/5 p-6 font-mono text-[10px] leading-relaxed text-white/60 space-y-1">
              <p className="text-white/20 italic"># Locate .env_example in root</p>
              <p className="text-white/20 italic"># Create new .env file</p>
              <p>API_KEY=<span className="text-white">AIzaSy...your_key_here</span></p>
              <p className="text-white/20 mt-4 underline italic hover:text-white transition-colors"><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Obtain API Access Link</a></p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 flex justify-center opacity-10 font-mono text-[8px] tracking-[0.5em] uppercase">
           <span className="flex items-center gap-4">
             <div className="w-1 h-1 bg-white animate-pulse"></div>
             Node Architecture: React + Gemini 3.0 Pro
           </span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
};

export default Hero;
