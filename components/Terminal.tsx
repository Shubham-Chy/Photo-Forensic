
import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: View) => void;
}

const TERMINAL_STORAGE_KEY = 'forensic_terminal_history';

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, setView }) => {
  const [history, setHistory] = useState<string[]>(['SYSTEM READY. TYPE "HELP" FOR COMMANDS.']);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem(TERMINAL_STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save history
  useEffect(() => {
    if (history.length > 1) {
      localStorage.setItem(TERMINAL_STORAGE_KEY, JSON.stringify(history.slice(-50)));
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `> ${input.toUpperCase()}`];
    
    if (cmd === 'help') {
      newHistory.push('AVAILABLE COMMANDS:', '- GOTO [VIEW]', '- CLEAR', '- STATUS', '- EXIT', '- WHOAMI');
    } else if (cmd === 'status') {
      newHistory.push('CORES: ONLINE', 'UPLINK: ACTIVE', 'LATENCY: 24MS', 'ENCRYPTION: AES-256');
    } else if (cmd === 'clear') {
      const cleared = ['HISTORY PURGED. SYSTEM READY.'];
      setHistory(cleared);
      localStorage.setItem(TERMINAL_STORAGE_KEY, JSON.stringify(cleared));
      setInput('');
      return;
    } else if (cmd === 'exit') {
      onClose();
      return;
    } else if (cmd === 'whoami') {
      newHistory.push('USER: ANONYMOUS_INVESTIGATOR', 'PERMISSIONS: LEVEL_4_FORENSIC');
    } else if (cmd.startsWith('goto ')) {
      const target = cmd.replace('goto ', '');
      if (['generate', 'edit', 'analyze', 'convert', 'archive', 'home'].includes(target)) {
        setView(target as View);
        newHistory.push(`NAVIGATING TO ${target.toUpperCase()}...`);
      } else {
        newHistory.push(`ERROR: SECTOR "${target.toUpperCase()}" NOT FOUND.`);
      }
    } else {
      newHistory.push(`UNKNOWN COMMAND: "${cmd.toUpperCase()}". TYPE "HELP" FOR LIST.`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-black border border-white/20 z-[100] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center p-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 bg-white animate-pulse"></div>
           <span className="font-mono text-[8px] tracking-[0.3em] uppercase opacity-40">System Terminal</span>
        </div>
        <button onClick={onClose} className="text-[10px] hover:text-white/50 px-2">×</button>
      </div>
      <div 
        ref={scrollRef}
        className="flex-grow p-4 overflow-y-auto font-mono text-[9px] space-y-1 text-white/70"
      >
        {history.map((line, i) => (
          <div key={i} className={line.startsWith('>') ? 'text-white font-bold' : ''}>{line}</div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="p-2 border-t border-white/10 flex items-center gap-2">
        <span className="font-mono text-[9px] text-white/40">{'>'}</span>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent outline-none flex-grow font-mono text-[9px] uppercase tracking-widest"
          placeholder="..."
        />
      </form>
    </div>
  );
};

export default Terminal;
