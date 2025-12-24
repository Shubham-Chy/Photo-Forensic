
import React, { useState, useRef, useEffect, useContext } from 'react';
import { editImage } from '../services/geminiService';
import { AuthContext } from '../App';
import { applyForensicWatermark } from '../utils/watermark';
import ErrorBanner from './ErrorBanner';
import FeatureLock from './FeatureLock';

const EDITOR_STATE_KEY = 'forensic_editor_v1';

const ImageEditor: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [instruction, setInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem(EDITOR_STATE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setOriginalImage(data.originalImage || null);
        setEditedImage(data.editedImage || null);
        setInstruction(data.instruction || '');
        setMimeType(data.mimeType || '');
      } catch (e) {}
    }
  }, []);

  // Save state
  useEffect(() => {
    const state = { originalImage, editedImage, instruction, mimeType };
    localStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(state));
  }, [originalImage, editedImage, instruction, mimeType]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !instruction) return;
    setIsEditing(true);
    setError(null);
    try {
      const result = await editImage(originalImage, mimeType, instruction);
      setEditedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsEditing(false);
    }
  };

  const downloadEditedImage = async (format: string) => {
    if (!editedImage) return;
    
    let finalDataUrl = editedImage;
    
    // Apply guest watermark if necessary
    if (user?.isGuest) {
      finalDataUrl = await applyForensicWatermark(editedImage, "GUEST_MOD_UNAUTHORIZED");
    }

    const link = document.createElement('a');
    link.download = `reconstructed-artifact-${Date.now()}.${format}`;
    link.href = finalDataUrl;
    link.click();
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !editedImage) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Use React.TouchEvent for proper type casting of synthetic touch events
    const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  return (
    <FeatureLock isLocked={!!user?.isGuest} label="Modifier">
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-7xl mb-6 uppercase tracking-tighter">Editor</h2>
          <p className="font-mono text-xs tracking-widest opacity-40 uppercase">Natural language image manipulation and structural reconstruction.</p>
        </div>

        <ErrorBanner message={error} onClear={() => setError(null)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            className="aspect-square bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-ew-resize"
          >
            {originalImage ? (
              <>
                {/* Edited Image (Bottom) */}
                {editedImage ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <img src={editedImage} className="max-w-full max-h-full object-contain grayscale" alt="Edited" />
                  </div>
                ) : null}

                {/* Original Image (Top, Clipped) */}
                <div 
                  className="absolute inset-0 flex items-center justify-center p-8 bg-black z-10 overflow-hidden" 
                  style={{ clipPath: editedImage ? `inset(0 ${100 - sliderPos}% 0 0)` : 'none' }}
                >
                  <img src={originalImage} className="max-w-full max-h-full object-contain grayscale opacity-60" alt="Original" />
                </div>

                {/* Slider Handle */}
                {editedImage && (
                  <div 
                    className="absolute top-0 bottom-0 w-[1px] bg-white z-20 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white bg-black flex items-center justify-center font-mono text-[8px] uppercase tracking-tighter shadow-xl">
                      DIFF
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center opacity-20 group-hover:opacity-40 transition-opacity">
                <p className="font-mono text-xs uppercase tracking-widest">Load Source Data</p>
              </div>
            )}
            
            {!originalImage && <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-30" accept="image/*" />}
            
            {isEditing && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[40] animate-in fade-in duration-300">
                 <div className="text-center space-y-4">
                   <div className="w-12 h-[1px] bg-white mx-auto animate-pulse"></div>
                   <p className="font-mono text-[10px] tracking-[0.5em] uppercase opacity-60">Synthesizing Matrix</p>
                 </div>
              </div>
            )}
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <label className="block font-mono text-[10px] tracking-widest opacity-40 uppercase">Transformation Command</label>
              <input 
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Input modification parameters..."
                className="w-full bg-transparent border-b border-white/10 py-4 font-mono text-xs focus:border-white outline-none transition-all uppercase tracking-widest placeholder:opacity-20"
              />
              {originalImage && (
                 <button onClick={() => {setOriginalImage(null); setEditedImage(null); setInstruction('');}} className="font-mono text-[8px] opacity-20 hover:opacity-100 uppercase tracking-widest transition-all">[Purge Workspace]</button>
              )}
            </div>

            <button 
              onClick={handleEdit}
              disabled={isEditing || !originalImage || !instruction}
              className="w-full py-5 bg-white text-black font-mono text-xs tracking-[0.4em] uppercase hover:bg-white/80 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              {isEditing ? 'Recalculating...' : 'Apply Modification'}
            </button>
            
            {editedImage && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="pt-8 border-t border-white/5 font-mono text-[9px] opacity-30 leading-loose uppercase tracking-[0.2em]">
                  <p>• Comparison Slider Active</p>
                  <p>• Source: Grayscale Normalized</p>
                  <p>• Target: Neural Reconstruction</p>
                </div>

                <div className="space-y-6">
                  <label className="block font-mono text-[10px] tracking-widest opacity-40 uppercase">Download Reconstruction</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['png', 'webp', 'jpg'].map(fmt => (
                      <button 
                        key={fmt}
                        onClick={() => downloadEditedImage(fmt)}
                        className="border border-white/10 px-4 py-4 font-mono text-[9px] tracking-[0.3em] uppercase hover:bg-white hover:text-black hover:border-white transition-all group"
                      >
                        <span className="opacity-60 group-hover:opacity-100">.{fmt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <canvas ref={hiddenCanvasRef} className="hidden" />
    </FeatureLock>
  );
};

export default ImageEditor;
