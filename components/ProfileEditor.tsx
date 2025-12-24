
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full border border-white/10 bg-black p-10 space-y-12 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="font-serif text-3xl uppercase tracking-tighter">Identity Profile</h2>
            <p className="font-mono text-[8px] tracking-[0.4em] opacity-30 uppercase">Subject ID: {user.id}</p>
          </div>
          <button onClick={onClose} className="font-mono text-[10px] opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">[Close]</button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block font-mono text-[9px] tracking-widest opacity-20 uppercase">Subject Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-xs focus:border-white outline-none transition-all uppercase tracking-widest"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block font-mono text-[9px] tracking-widest opacity-20 uppercase">Email Link</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-xs focus:border-white outline-none transition-all uppercase tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[9px] tracking-widest opacity-20 uppercase">Forensic Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                placeholder="+0 000 000 0000"
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-xs focus:border-white outline-none transition-all uppercase tracking-widest placeholder:opacity-10"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-white text-black font-mono text-[10px] tracking-[0.4em] uppercase hover:bg-white/80 transition-all">
              Commit Changes
            </button>
            <button 
              type="button" 
              onClick={() => { logout(); onClose(); }}
              className="px-6 py-4 border border-white/10 font-mono text-[9px] tracking-[0.2em] opacity-30 hover:opacity-100 hover:text-red-500 hover:border-red-500/30 transition-all uppercase"
            >
              Logout
            </button>
          </div>
        </form>

        <div className="pt-8 border-t border-white/5 font-mono text-[7px] opacity-10 uppercase tracking-[0.5em] flex justify-between">
          <span>SEC_MODE: AES-256</span>
          <span>SYNC: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
