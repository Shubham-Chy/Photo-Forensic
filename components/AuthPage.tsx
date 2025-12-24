
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const simulateGoogleLogin = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onLogin({
        id: 'user_882',
        name: 'Investigator Alpha',
        email: 'alpha@forensic.lab',
        phone: '+1 (555) 000-0000',
        picture: 'https://api.dicebear.com/7.x/identicon/svg?seed=forensic',
        isGuest: false
      });
    }, 1500);
  };

  const enterAsGuest = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onLogin({
        id: 'guest_' + Math.floor(Math.random() * 1000),
        name: 'Guest User',
        email: 'unverified@node.access',
        phone: 'UNLINKED',
        picture: '',
        isGuest: true
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      
      <div className="relative max-w-sm w-full space-y-16 text-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="space-y-6">
          <div className="space-y-4">
             <h2 className="font-mono text-xl tracking-[1em] opacity-60 uppercase italic">IDENTITY GATE</h2>
             <div className="h-[1px] w-12 bg-white/20 mx-auto"></div>
             <p className="font-mono text-[8px] tracking-[0.3em] opacity-20 uppercase">Analytical Node Node_Alpha_01</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={simulateGoogleLogin}
            disabled={isVerifying}
            className="w-full group relative px-8 py-5 bg-white text-black font-mono text-[9px] tracking-[0.4em] uppercase transition-all hover:bg-white/90 flex items-center justify-center gap-4 disabled:opacity-50 overflow-hidden"
          >
            {isVerifying ? (
              <span className="animate-pulse tracking-widest">Authorizing...</span>
            ) : (
              "Verified Google Access"
            )}
          </button>

          <button 
            onClick={enterAsGuest}
            disabled={isVerifying}
            className="w-full py-5 border border-white/10 font-mono text-[8px] tracking-[0.4em] uppercase opacity-30 hover:opacity-100 hover:border-white transition-all disabled:opacity-20"
          >
            Enter Guest Node
          </button>
        </div>

        <div className="p-6 border border-white/5 bg-white/[0.01] text-left space-y-4">
          <h2 className="font-mono text-[8px] tracking-[0.4em] opacity-30 uppercase border-b border-white/10 pb-2">Access Protocols</h2>
          <div className="space-y-2 font-mono text-[7px] uppercase tracking-widest leading-loose">
            <p className="flex justify-between"><span className="opacity-40">Verified Identity:</span> <span>Full Suite</span></p>
            <p className="flex justify-between"><span className="opacity-40">Guest Identity:</span> <span className="opacity-60 underline">Watermarked</span></p>
          </div>
        </div>

        <div className="pt-8 font-mono text-[7px] opacity-10 uppercase tracking-[0.5em] flex justify-between">
          <span>PORT: 8080</span>
          <span>LOCATION: SECURE_CORE</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
