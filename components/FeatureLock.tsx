
import React, { useState, useEffect, useRef } from 'react';

interface FeatureLockProps {
  isLocked: boolean;
  children: React.ReactNode;
  label: string;
}

const FeatureLock: React.FC<FeatureLockProps> = ({ isLocked, children, label }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLocked) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (eyeRef.current) {
        const rect = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const distance = Math.min(rect.width / 4, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 10);
        
        setMousePos({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLocked]);

  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-10 pointer-events-none filter blur-md grayscale select-none transition-all duration-1000">
        {children}
      </div>
      
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-700">
        <div className="max-w-md w-full p-12 border border-white/5 bg-black/80 shadow-2xl space-y-12 text-center relative overflow-hidden">
           {/* Geometric Watching Eye */}
           <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center group" ref={eyeRef}>
             {/* Eye Lid - Outer */}
             <div className="absolute inset-0 border border-white/10 rounded-full scale-110"></div>
             
             {/* Main Eye Shape */}
             <div className="w-full h-12 border border-white/40 rounded-[100%] flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:h-14">
               {/* Sclera Lines */}
               <div className="absolute inset-0 opacity-10 flex justify-between px-2">
                  <div className="w-[1px] h-full bg-white rotate-12"></div>
                  <div className="w-[1px] h-full bg-white -rotate-12"></div>
               </div>

               {/* Pupil/Iris */}
               <div 
                 className="w-5 h-5 border border-white bg-white/10 rounded-full flex items-center justify-center transition-transform duration-75 ease-out"
                 style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
               >
                 <div className="w-1 h-1 bg-white animate-pulse"></div>
               </div>
             </div>

             {/* Tech HUD elements around eye */}
             <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-white/20"></div>
             <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-white/20"></div>
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[6px] tracking-[0.5em] opacity-10 uppercase">Observation_Active</div>
           </div>

           <div className="space-y-6">
             <div className="space-y-2">
               <h3 className="font-serif text-4xl uppercase tracking-tighter italic text-white/90">Sector Restricted</h3>
               <p className="font-mono text-[9px] tracking-[0.5em] opacity-40 uppercase italic">Authorized Neural Link Required</p>
             </div>
             
             <div className="pt-6 border-t border-white/5">
               <p className="font-mono text-[10px] text-white/60 leading-relaxed uppercase tracking-widest mb-4">
                 {label} is locked to verified investigators.
               </p>
               <p className="font-mono text-[8px] opacity-20 uppercase tracking-[0.2em] leading-relaxed">
                 Identity verification is necessary to bypass <br/> the watermark engine and access full compute power.
               </p>
             </div>
           </div>

           {/* Animated Scanner line for extra polish */}
           <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5 overflow-hidden">
             <div className="w-1/4 h-full bg-white/20 animate-[slide_4s_linear_infinite]"></div>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default FeatureLock;
