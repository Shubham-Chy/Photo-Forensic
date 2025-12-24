
import React, { useState, useContext, useEffect } from 'react';
import { View } from '../types';
import { AuthContext } from '../App';
import BackgroundNetwork from './BackgroundNetwork';
import Terminal from './Terminal';
import ProtocolModal from './ProtocolModal';
import ProfileEditor from './ProfileEditor';
import { getCookie } from '../utils/cookies';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
}

const NAV_ITEMS = [
  { 
    id: View.CONVERT, 
    label: 'Extractor', 
    tooltip: 'Isolate highlights and remove backgrounds.' 
  },
  { 
    id: View.GENERATE, 
    label: 'Synthesizer', 
    tooltip: 'Create high-fidelity monochromatic art.' 
  },
  { 
    id: View.EDIT, 
    label: 'Modifier', 
    tooltip: 'Transform images with natural language.' 
  },
  { 
    id: View.ANALYZE, 
    label: 'Inspector', 
    tooltip: 'Deep semantic and technical analysis.' 
  }
];

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user } = useContext(AuthContext);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cookieStatus, setCookieStatus] = useState('CHECKING');

  useEffect(() => {
    const check = () => {
      const hasCookie = !!getCookie('FORENSIC_AUTH');
      setCookieStatus(hasCookie ? 'PERSISTENT' : 'TRANSIENT');
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <BackgroundNetwork />
      <div className="scanline"></div>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[60] p-6 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div 
          className="font-mono text-lg font-bold cursor-pointer tracking-tighter hover:tracking-normal transition-all duration-500 flex items-center gap-2 group"
          onClick={() => setView(View.HOME)}
        >
          <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
          PHOTO <span className="opacity-40 font-light">FORENSIC</span>
        </div>
        
        <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.3em] font-mono">
          {NAV_ITEMS.map((item) => (
            <div key={item.id} className="relative group/tooltip">
              <button
                onClick={() => setView(item.id)}
                className={`hover:text-white transition-all relative py-1 ${currentView === item.id ? 'text-white' : 'text-white/30'}`}
              >
                {item.label}
                {currentView === item.id && <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-white"></div>}
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 px-4 py-3 bg-white text-black text-[9px] tracking-widest leading-relaxed uppercase opacity-0 group-hover/tooltip:opacity-100 translate-y-2 group-hover/tooltip:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                {item.tooltip}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button 
            className="flex items-center gap-2 border border-white/10 px-4 py-2 hover:border-white/40 transition-all group"
            onClick={() => setView(View.ASSISTANT)}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${currentView === View.ASSISTANT ? 'bg-white animate-pulse' : 'bg-white/20'}`}></div>
            <span className="font-mono text-[9px] tracking-widest opacity-60 group-hover:opacity-100 uppercase">UPLINK</span>
          </button>

          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-4 pl-6 border-l border-white/10 group relative hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="font-mono text-[9px] tracking-widest uppercase truncate max-w-[80px]">{user?.name}</p>
              <p className="font-mono text-[7px] opacity-30 tracking-[0.3em] uppercase">{user?.isGuest ? 'GUEST' : 'LEVEL_4'}</p>
            </div>
            {user?.picture ? (
              <img src={user.picture} alt="User" className="w-8 h-8 grayscale border border-white/20 p-1" />
            ) : (
              <div className="w-8 h-8 bg-white/5 border border-white/20 flex items-center justify-center font-mono text-[10px] opacity-40">ID</div>
            )}
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-24 px-6 md:px-12 lg:px-24 z-10">
        {children}
      </main>

      <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} setView={setView} />
      <ProtocolModal isOpen={isProtocolOpen} onClose={() => setIsProtocolOpen(false)} />
      <ProfileEditor isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <footer className="p-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] tracking-[0.4em] font-mono uppercase">
        <div className="flex items-center gap-4 opacity-20">
          <span>&copy; 2025 PHOTO FORENSIC LABS</span>
          <span className="h-[1px] w-8 bg-white/20"></span>
          <span className="flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${cookieStatus === 'PERSISTENT' ? 'bg-white' : 'bg-white/20'}`}></div>
            SECURE_SESSION: {cookieStatus}
          </span>
        </div>
        <div className="flex gap-12">
          <button onClick={() => setIsProtocolOpen(true)} className="opacity-30 hover:opacity-100 hover:tracking-[0.6em] transition-all duration-500">Protocol</button>
          <button onClick={() => setView(View.ARCHIVE)} className={`transition-all duration-500 hover:tracking-[0.6em] ${currentView === View.ARCHIVE ? 'opacity-100 text-white' : 'opacity-30 hover:opacity-100'}`}>Archive</button>
          <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className={`transition-all duration-500 hover:tracking-[0.6em] ${isTerminalOpen ? 'opacity-100 text-white' : 'opacity-30 hover:opacity-100'}`}>Terminal</button>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
