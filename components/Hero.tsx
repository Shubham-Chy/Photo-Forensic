
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
      {/* Main Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-16 py-12">
        <div className="relative">
          <h1 className="font-serif text-[12vw] md:text-[10vw] leading-none tracking-tighter mix-blend-difference z-10 relative">
            PHOTO<br />
            FORENSIC
          </h1>
          {/* Decorative Grid Lines */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1px] bg-white/[0.03] -z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[140%] bg-white/[0.03] -z-0"></div>
        </div>

        <div className="max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <p className="font-mono text-[10px] md:text-xs tracking-[0.4em] opacity-40 leading-relaxed uppercase max-w-lg mx-auto">
            Advanced digital asset investigation suite. 
            <br/>Neural reconstruction & highlight extraction.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {/* Enter Laboratory Button - High Tech Style */}
            <button 
              onClick={() => onStart(View.CONVERT)}
              className="group relative px-10 py-6 bg-white text-black font-mono text-[11px] tracking-[0.5em] uppercase transition-all duration-500 hover:bg-black hover:text-white border border-white overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <div className="absolute inset-0 border border-current opacity-20 rounded-full animate-ping"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                </div>
                <span>Enter Laboratory</span>
              </div>
              
              {/* Scanline Effect on Hover */}
              <div className="absolute inset-0 bg-white/5 -translate-y-full group-hover:animate-[scan_2s_linear_infinite] pointer-events-none opacity-0 group-hover:opacity-100"></div>
              
              {/* Corner markers */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-current opacity-30"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-current opacity-30"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-current opacity-30"></div>
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-current opacity-30"></div>
            </button>

            {/* Inspector Mode Button - Ghost Style */}
            <button 
              onClick={() => onStart(View.ANALYZE)}
              className="group relative px-10 py-6 border border-white/10 font-mono text-[11px] tracking-[0.5em] uppercase hover:border-white hover:text-white transition-all duration-500 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center">
                <span className="opacity-60 group-hover:opacity-100">Inspector Mode</span>
                <span className="text-[7px] opacity-20 group-hover:opacity-40 tracking-widest mt-1">Status: Active_Uplink</span>
              </div>
              
              <DiagnosticCorners />
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-500"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Feature List Section */}
      <div className="mt-32 border-t border-white/5 pt-24 pb-12">
        <div className="mb-20">
          <h2 className="font-mono text-[9px] tracking-[1.5em] opacity-20 uppercase text-center italic">Diagnostic Protocols & Capabilities</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="group relative pt-8 border-t border-white/5 hover:border-white/20 transition-colors duration-500">
              <div className="absolute -top-[1px] left-0 w-8 h-[1px] bg-white/40 group-hover:w-full transition-all duration-700"></div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] font-bold uppercase group-hover:text-white text-white/60 transition-all duration-500">
                    {feature.title}
                  </h3>
                  <span className="font-mono text-[8px] opacity-10 group-hover:opacity-30">MOD_{idx + 22}</span>
                </div>
                <p className="font-mono text-[9px] opacity-30 leading-relaxed uppercase tracking-widest group-hover:opacity-50 transition-opacity">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>

      {/* Background decoration */}
      <div className="fixed top-0 right-0 p-12 opacity-10 pointer-events-none hidden lg:block">
        <div className="font-mono text-[8px] space-y-1 text-right">
          <p className="opacity-40 tracking-widest">SYSTEM_LOG_v2.1</p>
          <div className="w-32 h-[1px] bg-white/20 my-2"></div>
          <p>X-COORD: 40.7128 N</p>
          <p>Y-COORD: 74.0060 W</p>
          <p className="text-white/20 animate-pulse">ENCRYPTION: AES_256</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
