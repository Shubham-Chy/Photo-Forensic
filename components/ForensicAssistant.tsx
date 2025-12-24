
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AuthContext } from '../App';
import FeatureLock from './FeatureLock';
import ErrorBanner from './ErrorBanner';

const ForensicAssistant: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [isActive, setIsActive] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [audioBars, setAudioBars] = useState<number[]>(new Array(20).fill(2));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    try {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      setHasKey(ok);
    } catch (e) {
      setHasKey(false);
    }
  };

  const handleOpenKeyDialog = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
      setError(null);
    } catch (e) {
      setError("FAILED TO OPEN CREDENTIAL DIALOG");
    }
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const bars = Array.from({ length: 20 }, () => Math.random() * 20 + 2);
              setAudioBars(bars);

              const base64 = encode(new Uint8Array(int16.buffer));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Interruption
            if (msg.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (msg.serverContent?.outputTranscription) {
               setTranscription(prev => [...prev.slice(-2), msg.serverContent!.outputTranscription!.text]);
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => {
            console.error("Assistant Error:", e);
            setError("NETWORK UPLINK ERROR: CONNECTION REFUSED BY REMOTE NODE.");
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are the Photo Forensic Core Assistant. Your tone is cold, professional, and efficient. You help investigators analyze visual data and understand AI artifacts.',
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes("not found") || msg.includes("API key")) {
        setHasKey(false);
        setError("UPLINK DENIED: INVALID API CREDENTIALS.");
      } else {
        setError(msg);
      }
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
    setAudioBars(new Array(20).fill(2));
  };

  if (hasKey === null) return null;

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-4">
          <div className="w-16 h-16 border border-white mx-auto flex items-center justify-center mb-8 relative">
            <div className="w-2 h-2 bg-white animate-pulse"></div>
          </div>
          <h2 className="font-serif text-4xl uppercase tracking-widest">Assistant Credentials Required</h2>
          <p className="font-mono text-[10px] tracking-[0.4em] opacity-40 uppercase italic">Native Audio Node Requires Verified Billing</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 max-w-lg mx-auto">
          <p className="font-mono text-[10px] opacity-60 uppercase leading-loose text-left">
            Gemini Live Native Audio is a high-compute protocol. You must link a personal API key from a paid GCP project to establish a secure uplink.
          </p>
          <button onClick={handleOpenKeyDialog} className="w-full py-5 bg-white text-black font-mono text-[11px] tracking-[0.5em] uppercase hover:bg-white/80 transition-all flex items-center justify-center gap-2">
            [Link Assistant Key]
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block font-mono text-[8px] opacity-20 hover:opacity-100 uppercase tracking-widest underline underline-offset-4">Setup Instructions</a>
        </div>
        {error && <div className="max-w-lg mx-auto"><ErrorBanner message={error} onClear={() => setError(null)} /></div>}
      </div>
    );
  }

  return (
    <FeatureLock isLocked={!!user?.isGuest} label="Neural Uplink">
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4 opacity-20">
             <span className="font-mono text-[8px] uppercase tracking-widest">Uplink: Native_Audio_v2.5</span>
             <button onClick={() => setHasKey(false)} className="font-mono text-[8px] uppercase tracking-widest underline">[Change Key]</button>
          </div>
          <h2 className="font-serif text-5xl md:text-7xl mb-6 uppercase tracking-tighter">Neural Uplink</h2>
          <p className="font-mono text-xs tracking-[0.5em] opacity-40 uppercase italic">Real-time voice interface for forensic analysis.</p>
        </div>

        {error && <div className="w-full max-w-lg mb-8"><ErrorBanner message={error} onClear={() => setError(null)} /></div>}

        <div className="relative w-80 h-80 flex items-center justify-center border border-white/5 rounded-full mb-12 group">
          <div className={`absolute inset-0 border border-white/20 rounded-full transition-all duration-1000 ${isActive ? 'scale-110 opacity-100 animate-ping' : 'scale-100 opacity-20'}`}></div>
          <div className={`w-48 h-48 border border-white/10 rounded-full flex items-center justify-center bg-white/[0.02] ${isActive ? 'animate-pulse' : ''}`}>
             <div className="flex items-end gap-1 h-12">
               {audioBars.map((h, i) => (
                 <div key={i} className="w-1 bg-white transition-all duration-75" style={{ height: `${h}px`, opacity: isActive ? 0.8 : 0.1 }}></div>
               ))}
             </div>
          </div>
          <div className="absolute -top-4 -right-4 font-mono text-[7px] tracking-widest opacity-20 text-right uppercase">
            Freq: 16000Hz<br/>Latency: 45ms<br/>Secure: AES-256
          </div>
        </div>

        <div className="space-y-8 w-full max-w-lg text-center">
          {!isActive ? (
            <button 
              onClick={startSession}
              className="px-12 py-5 bg-white text-black font-mono text-xs tracking-[0.4em] uppercase hover:bg-white/80 transition-all glitch-hover"
            >
              Initiate Uplink
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-12 py-5 border border-white/20 font-mono text-xs tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all"
            >
              Terminate Session
            </button>
          )}

          <div className="min-h-[80px] flex flex-col items-center justify-center space-y-3">
            {transcription.map((t, i) => (
              <p key={i} className={`font-mono text-[10px] tracking-widest uppercase animate-in fade-in slide-in-from-bottom-2 ${i === transcription.length - 1 ? 'opacity-90' : 'opacity-30'}`}>
                {t}
              </p>
            ))}
            {!isActive && <p className="font-mono text-[9px] opacity-20 uppercase tracking-[0.3em]">System Standby - Ready for Vocal Injection</p>}
          </div>
        </div>
      </div>
    </FeatureLock>
  );
};

export default ForensicAssistant;
