
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
      
      <div className="relative max-w-md w-full space-y-16 text-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="space-y-4">
          <div className="w-12 h-12 border border-white mx-auto flex items-center justify-center mb-8 relative">
            <div className="w-1 h-1 bg-white animate-pulse"></div>
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white"></div>
          </div>
          <h1 className="font-serif text-5xl tracking-tighter uppercase">Identity Gate</h1>
          <p className="font-mono text-[10px] tracking-[0.5em] opacity-40 uppercase italic">Secured Forensic Node Access</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={simulateGoogleLogin}
            disabled={isVerifying}
            className="w-full group relative px-8 py-5 bg-white text-black font-mono text-[10px] tracking-[0.4em] uppercase transition-all hover:bg-white/90 flex items-center justify-center gap-4 disabled:opacity-50 overflow-hidden"
          >
            {isVerifying ? (
              <span className="animate-pulse">Authorizing...</span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Verified Google Access
              </>
            )}
          </button>

          <button 
            onClick={enterAsGuest}
            disabled={isVerifying}
            className="w-full py-5 border border-white/10 font-mono text-[9px] tracking-[0.4em] uppercase opacity-40 hover:opacity-100 hover:border-white transition-all disabled:opacity-20"
          >
            Enter Restricted Guest Node
          </button>
        </div>

        <div className="p-8 border border-white/5 bg-white/[0.02] text-left space-y-4">
          <h2 className="font-mono text-[9px] tracking-[0.4em] opacity-30 uppercase border-b border-white/10 pb-2">Access Protocols</h2>
          <div className="space-y-2 font-mono text-[8px] uppercase tracking-widest leading-loose">
            <p className="flex justify-between"><span className="opacity-40">Verified Identity:</span> <span>Full Suite + Clean Exports</span></p>
            <p className="flex justify-between"><span className="opacity-40">Guest Identity:</span> <span className="text-white/60 underline">Limited Suite + Watermarked</span></p>
            <p className="pt-2 opacity-20 text-[7px] italic">Locked: Synthesizer, Modifier, Neural Uplink</p>
          </div>
        </div>

        <div className="pt-8 font-mono text-[7px] opacity-10 uppercase tracking-[0.5em] flex justify-between">
          <span>PORT: 8080</span>
          <span>LOCATION: {new Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
