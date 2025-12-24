
import React, { useState, useRef, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { applyForensicWatermark } from '../utils/watermark';

const EXTRACTOR_KEY = 'forensic_extractor_v1';

const IconConverter: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isolateMode, setIsolateMode] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem(EXTRACTOR_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPreview(data.preview || null);
        setIsolateMode(data.isolateMode !== undefined ? data.isolateMode : true);
      } catch (e) {}
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem(EXTRACTOR_KEY, JSON.stringify({ preview, isolateMode }));
  }, [preview, isolateMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const processImage = () => {
    if (!preview || !canvasRef.current) return;
    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const avg = (r + g + b) / 3;
          
          if (isolateMode) {
            const threshold = 128;
            if (avg > threshold) {
              data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
            } else {
              data[i + 3] = 0;
            }
          } else {
            const val = avg > 128 ? 255 : 0;
            data[i] = val; data[i + 1] = val; data[i + 2] = val; data[i + 3] = 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setPreview(canvas.toDataURL());
        setProcessing(false);
      }
    };
    img.src = preview;
  };

  const downloadImage = async (format: string) => {
    if (!canvasRef.current) return;
    let dataUrl = canvasRef.current.toDataURL();
    
    if (user?.isGuest) {
      dataUrl = await applyForensicWatermark(dataUrl, "GUEST_EXTRACT_UNAUTHORIZED");
    }

    const link = document.createElement('a');
    link.download = `monochrome-icon-${user?.isGuest ? 'guest' : 'verified'}.${format}`;
    
    let mimeType = `image/${format}`;
    if (format === 'ico') mimeType = 'image/x-icon';
    if (format === 'svg') mimeType = 'image/svg+xml';
    
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-16">
        <h2 className="font-serif text-5xl md:text-7xl mb-6 uppercase tracking-tighter">Icon Labs</h2>
        <p className="font-mono text-xs tracking-widest opacity-40 uppercase">Isolate highlights and strip backgrounds for pure vector-like assets.</p>
        {user?.isGuest && <p className="font-mono text-[9px] mt-4 text-white/20 uppercase tracking-[0.3em]">Guest Mode: Outputs will be watermarked</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="relative group">
          <div className="aspect-square bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'conic-gradient(#fff 90deg, #000 90deg 180deg, #fff 180deg 270deg, #000 270deg)', backgroundSize: '20px 20px' }}></div>
            
            {preview ? (
              <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain p-8 transition-all duration-700 z-10" />
            ) : (
              <div className="text-center opacity-20 group-hover:opacity-40 transition-opacity z-10">
                <p className="font-mono text-xs">LOAD SOURCE IMAGE</p>
              </div>
            )}
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" />
          </div>
          <p className="mt-4 font-mono text-[9px] opacity-30 text-center uppercase tracking-widest">Supports PNG, JPG, WEBP</p>
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
            <label className="block font-mono text-[10px] tracking-widest opacity-40 uppercase">Processing Engine</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsolateMode(true)}
                className={`flex-1 py-3 font-mono text-[10px] tracking-widest uppercase transition-all border ${isolateMode ? 'bg-white text-black border-white' : 'border-white/20 text-white/60 hover:border-white/40'}`}
              >
                Highlight Isolation
              </button>
              <button 
                onClick={() => setIsolateMode(false)}
                className={`flex-1 py-3 font-mono text-[10px] tracking-widest uppercase transition-all border ${!isolateMode ? 'bg-white text-black border-white' : 'border-white/20 text-white/60 hover:border-white/40'}`}
              >
                Solid Binary
              </button>
            </div>
            
            <button 
              onClick={processImage}
              disabled={!preview || processing}
              className="w-full py-4 bg-white text-black font-mono text-xs tracking-[0.3em] uppercase hover:bg-white/90 disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {processing ? 'Calculating Matrix...' : 'Execute Transformation'}
            </button>
            {preview && (
              <button onClick={() => {setPreview(null); setFile(null);}} className="w-full font-mono text-[8px] opacity-20 hover:opacity-100 uppercase tracking-widest transition-all py-2">[Clear Node]</button>
            )}
          </div>

          {preview && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <label className="block font-mono text-[10px] tracking-widest opacity-40 mb-4 uppercase">Download Assets</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['png', 'webp', 'ico'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => downloadImage(fmt)}
                    className="border border-white/10 px-4 py-3 font-mono text-[9px] tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all"
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default IconConverter;
