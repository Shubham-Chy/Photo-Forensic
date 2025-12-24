import React, { useState, useRef, useEffect } from "react";
import { analyzeImage, generateSpeech } from "../services/geminiService";
import { saveResult } from "../services/storageService";
import { MetadataInfo, ExifData } from "../types";
import { extractExif } from "../utils/exifParser";
import ErrorBanner from "./ErrorBanner";

const SESSION_STORAGE_KEY = "forensic_active_session_v1";

interface Citation {
  web?: { uri: string; title: string };
}

interface ReportSection {
  title: string;
  content: string[];
}

type SessionStatus = "IDLE" | "SAVING" | "SAVED" | "ERROR" | "RESTORING";

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++)
    bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [metadata, setMetadata] = useState<MetadataInfo | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      setHasStoredSession(true);
      try {
        const data = JSON.parse(savedSession);
        applySessionData(data);
      } catch (e) {}
    }
    checkKeyStatus();
    return () => {
      if (currentSourceRef.current) currentSourceRef.current.stop();
    };
  }, []);

  const checkKeyStatus = async () => {
    try {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      const hasEnv =
        !!process.env.API_KEY && process.env.API_KEY !== "undefined";
      setHasKey(ok || hasEnv);
    } catch (e) {
      setHasKey(!!process.env.API_KEY);
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

  const applySessionData = (data: any) => {
    setImage(data.image);
    setMimeType(data.mimeType);
    setAnalysis(data.analysis);
    setCitations(data.citations || []);
    setMetadata(data.metadata);
    setExif(data.exif);
  };

  const handleRestoreSession = () => {
    setSessionStatus("RESTORING");
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        applySessionData(data);
        setTimeout(() => setSessionStatus("IDLE"), 800);
      } catch (e) {
        setError("VAULT CORRUPTION: DATA RECOVERY FAILED.");
        setSessionStatus("ERROR");
      }
    }
  };

  const commitSave = () => {
    setSessionStatus("SAVING");
    setShowOverwriteConfirm(false);
    const sessionData = {
      image,
      mimeType,
      analysis,
      citations,
      metadata,
      exif,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      setHasStoredSession(true);
      setSessionStatus("SAVED");
      setTimeout(() => setSessionStatus("IDLE"), 2000);
    } catch (e) {
      setError("SESSION CAPACITY EXCEEDED.");
      setSessionStatus("ERROR");
    }
  };

  const handleSaveRequest = () => {
    if (!image && !analysis) return;
    if (localStorage.getItem(SESSION_STORAGE_KEY))
      setShowOverwriteConfirm(true);
    else commitSave();
  };

  const parseAnalysis = (text: string): ReportSection[] => {
    const sections: ReportSection[] = [];
    const sectionPattern = /\[(S[^\]]+|T[^\]]+|G[^\]]+|I[^\]]+)\]/g;
    const parts = text.split(sectionPattern);
    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i].replace(/_/g, " ");
      const content = parts[i + 1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) =>
          line.replace(/^\*\s*|^\-\s*/, "• ").replace(/\*\*/g, "")
        );
      sections.push({ title, content });
    }
    if (sections.length === 0)
      sections.push({
        title: "GENERAL REPORT",
        content: text
          .split("\n")
          .filter((l) => l.trim().length > 0)
          .map((l) => l.replace(/\*\*/g, "")),
      });
    return sections;
  };

  const handleLensSearch = () => {
    if (!analysis) return;
    const sections = parseAnalysis(analysis);
    const summarySection = sections.find((s) =>
      s.title.toUpperCase().includes("SUBJECT SUMMARY")
    );
    const query =
      summarySection && summarySection.content.length > 0
        ? summarySection.content[0].replace("• ", "").substring(0, 100)
        : metadata?.filename || "unknown subject";
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`,
      "_blank"
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        setImage(dataUrl);
        setError(null);
        setAnalysis(null);
        setExif(null);
        const img = new Image();
        img.onload = () =>
          setMetadata({
            filename: file.name.toUpperCase(),
            size: `${(file.size / 1024).toFixed(2)} KB`,
            dimensions: `${img.width} X ${img.height} PX`,
            type: file.type.toUpperCase(),
            lastModified: new Date(file.lastModified)
              .toLocaleString()
              .toUpperCase(),
          });
        img.src = dataUrl;
        const exifData = await extractExif(file);
        setExif(exifData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeImage(image, mimeType);
      setAnalysis(result.text);
      setCitations(result.citations);
      saveResult({
        type: "analysis",
        data: result.text,
        prompt: `Deep Scan: ${metadata?.filename || "UNKNOWN"}`,
      });
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes("API_KEY") || msg.includes("not found"))
        setHasKey(false);
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeak = async () => {
    if (!analysis) return;
    if (isSpeaking) {
      currentSourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      const audioBase64 = await generateSpeech(analysis);
      if (!audioContextRef.current)
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") await ctx.resume();
      const audioBuffer = await decodeAudioData(
        decodeBase64(audioBase64),
        ctx,
        24000,
        1
      );
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      currentSourceRef.current = source;
      source.start(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsSpeaking(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-4">
          <div className="w-16 h-16 border border-white mx-auto flex items-center justify-center mb-8 relative">
            <div className="w-2 h-2 bg-white animate-pulse"></div>
          </div>
          <h2 className="font-serif text-4xl uppercase tracking-widest">
            Inspector Credentials Required
          </h2>
          <p className="font-mono text-[10px] tracking-[0.4em] opacity-40 uppercase italic">
            External API Uplink Mandatory
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 max-w-lg mx-auto">
          <p className="font-mono text-[10px] opacity-60 uppercase leading-loose text-left">
            The Inspector module uses high-compute Gemini reasoning. Link your
            API key to enable visual forensics.
          </p>
          <button
            onClick={handleOpenKeyDialog}
            className="w-full py-5 bg-white text-black font-mono text-[11px] tracking-[0.5em] uppercase hover:bg-white/80 transition-all"
          >
            [Link Protocol Key]
          </button>
        </div>
        {error && (
          <div className="max-w-lg mx-auto">
            <ErrorBanner message={error} onClear={() => setError(null)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 pb-32">
      <div className="text-center mb-16 relative">
        <h2 className="font-serif text-5xl md:text-7xl mb-6 uppercase tracking-tighter">
          Inspector
        </h2>
        <p className="font-mono text-xs tracking-widest opacity-40 uppercase">
          Digital forensic decoding & visual context search.
        </p>
        <div className="mt-6 flex justify-center items-center gap-6">
          {hasStoredSession && !image && (
            <button
              onClick={handleRestoreSession}
              className="font-mono text-[8px] tracking-[0.4em] opacity-40 hover:opacity-100 uppercase border border-white/10 px-4 py-2 transition-all"
            >
              {sessionStatus === "RESTORING"
                ? "[RECOVERING...]"
                : "[RESTORE_FROM_VAULT]"}
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} onClear={() => setError(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="aspect-video bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden group">
            {image ? (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={image}
                  alt="Target"
                  className="max-w-full max-h-full object-contain grayscale opacity-80"
                />
                <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
                  <div className="w-full h-full border border-white/5 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/40"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/40"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/40"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/40"></div>
                    <div
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        isAnalyzing ? "opacity-20" : "opacity-0"
                      }`}
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-20 group-hover:opacity-40 transition-opacity">
                <p className="font-mono text-xs uppercase tracking-widest">
                  Inject Bitstream For Scanning
                </p>
              </div>
            )}
            {!image && (
              <input
                type="file"
                onChange={handleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                accept="image/*"
              />
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-[2px] bg-white absolute top-0 left-0 shadow-[0_0_20px_white] animate-[scan_3s_ease-in-out_infinite] z-20"></div>
                <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-start gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !image}
              className="px-12 py-5 border border-white/20 font-mono text-[10px] tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all disabled:opacity-20 tech-hover"
            >
              {isAnalyzing
                ? "Running Neural Protocols..."
                : "Start Forensic Analysis"}
            </button>
            <button
              onClick={handleSaveRequest}
              disabled={sessionStatus === "SAVING" || (!image && !analysis)}
              className={`px-8 py-5 border border-white/20 font-mono text-[10px] tracking-[0.4em] uppercase transition-all tech-hover ${
                sessionStatus === "SAVED" ? "bg-white text-black" : ""
              }`}
            >
              {sessionStatus === "SAVING"
                ? "[SAVING...]"
                : sessionStatus === "SAVED"
                ? "[SAVED_TO_VAULT]"
                : "[Save Session]"}
            </button>
            {analysis && (
              <>
                <button
                  onClick={handleLensSearch}
                  className="px-8 py-5 border border-white/20 font-mono text-[10px] tracking-[0.4em] uppercase transition-all tech-hover flex items-center gap-2"
                >
                  <div className="w-2 h-2 border border-current rounded-full"></div>
                  [Visual Lookup]
                </button>
                <button
                  onClick={handleSpeak}
                  className={`px-8 py-5 border border-white/20 font-mono text-[10px] tracking-[0.4em] uppercase transition-all tech-hover flex items-center gap-3 ${
                    isSpeaking ? "bg-white text-black" : ""
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-current ${
                      isSpeaking ? "animate-pulse" : ""
                    }`}
                  ></div>
                  {isSpeaking ? "[Stop Audio]" : "[Audio Briefing]"}
                </button>
              </>
            )}
          </div>
          {analysis && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {parseAnalysis(analysis).map((section, sIdx) => (
                <div
                  key={sIdx}
                  className="border-t border-white/10 pt-8 first:border-0 first:pt-0"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="font-mono text-[10px] tracking-[0.5em] text-white/40 uppercase">
                      {section.title}
                    </h3>
                    <div className="h-[1px] flex-grow bg-white/5"></div>
                  </div>
                  <div className="space-y-4">
                    {section.content.map((line, lIdx) => (
                      <p
                        key={lIdx}
                        className={`font-serif text-lg md:text-xl leading-relaxed opacity-80 italic tracking-tighter ${
                          line.startsWith("•") ? "pl-6 -indent-6" : ""
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-8">
          <div className="border border-white/10 p-8 space-y-6 bg-black">
            <h3 className="font-mono text-[10px] tracking-[0.4em] opacity-30 uppercase border-b border-white/5 pb-4">
              Stream Data
            </h3>
            {metadata ? (
              <div className="space-y-6 font-mono text-[9px] uppercase tracking-widest">
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="opacity-20">Identity</span>
                  <span className="opacity-80 truncate max-w-[120px]">
                    {metadata.filename}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="opacity-20">Res</span>
                  <span className="opacity-80">{metadata.dimensions}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="opacity-20">Size</span>
                  <span className="opacity-80">{metadata.size}</span>
                </div>
              </div>
            ) : (
              <p className="font-mono text-[9px] opacity-10 uppercase italic">
                Awaiting upload...
              </p>
            )}
          </div>
          <div
            className={`border border-white/10 p-8 space-y-6 bg-black transition-opacity duration-500 ${
              exif ? "opacity-100" : "opacity-20"
            }`}
          >
            <h3 className="font-mono text-[10px] tracking-[0.4em] opacity-30 uppercase border-b border-white/5 pb-4">
              Header Artifacts
            </h3>
            {exif && (
              <div className="space-y-6 font-mono text-[9px] uppercase tracking-widest">
                {exif.make && (
                  <div className="flex justify-between border-b border-white/[0.03] pb-2">
                    <span className="opacity-20">Vendor</span>
                    <span className="opacity-80">{exif.make}</span>
                  </div>
                )}
                {exif.model && (
                  <div className="flex justify-between border-b border-white/[0.03] pb-2">
                    <span className="opacity-20">Machine</span>
                    <span className="opacity-80">{exif.model}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}</style>
    </div>
  );
};

export default ImageAnalyzer;
