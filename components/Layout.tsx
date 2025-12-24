
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
  { id: View.CONVERT, label: 'Extractor', tooltip: 'Isolate highlights and remove backgrounds.' },
  { id: View.GENERATE, label: 'Synthesizer', tooltip: 'Create high-fidelity monochromatic art.' },
  { id: View.EDIT, label: 'Modifier', tooltip: 'Transform images with natural language.' },
  { id: View.ANALYZE, label: 'Inspector', tooltip: 'Deep semantic and technical analysis.' }
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
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => setView(View.HOME)}
        >
          <div className="w-1.5 h-1.5 bg-white animate-pulse"></div>
          <div className="font-mono text-[10px] font-bold tracking-[0.5em] uppercase">
            FORENSIC <span className="opacity-30 font-light">LABS</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-[9px] uppercase tracking-[0.3em] font-mono">
          {NAV_ITEMS.map((item) => (
            <div key={item.id} className="relative group/tooltip">
              <button
                onClick={() => setView(item.id)}
                className={`hover:text-white transition-all relative py-1 ${currentView === item.id ? 'text-white' : 'text-white/30'}`}
              >
                {item.label}
                {currentView === item.id && <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-white"></div>}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button 
            className="flex items-center gap-2 border border-white/10 px-4 py-2 hover:border-white/40 transition-all group"
            onClick={() => setView(View.ASSISTANT)}
          >
            <div className={`w-1 h-1 rounded-full ${currentView === View.ASSISTANT ? 'bg-white animate-pulse' : 'bg-white/20'}`}></div>
            <span className="font-mono text-[8px] tracking-widest opacity-60 group-hover:opacity-100 uppercase">UPLINK</span>
          </button>

          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center grayscale transition-all hover:border-white/40"
          >
            {user?.picture ? (
              <img src={user.picture} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="font-mono text-[8px] opacity-40 uppercase">ID</div>
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

      <footer className="p-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] tracking-[0.4em] font-mono uppercase opacity-30 hover:opacity-100 transition-opacity">
        <div>&copy; 2025 PHOTO FORENSIC LABS</div>
        <div className="flex gap-12">
          <button onClick={() => setIsProtocolOpen(true)}>Protocol</button>
          <button onClick={() => setView(View.ARCHIVE)}>Archive</button>
          <button onClick={() => setIsTerminalOpen(!isTerminalOpen)}>Terminal</button>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
