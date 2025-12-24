import React, { useState, useEffect } from "react";
import { User } from "../types";
import { resolveApiKey } from "../services/geminiService";

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualKey, setManualKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsManualInput, setNeedsManualInput] = useState(false);

  useEffect(() => {
    // Initial check: if env key exists, we can proceed to verification immediately
    const existingKey = resolveApiKey();
    if (existingKey) {
      setNeedsManualInput(false);
    } else {
      setNeedsManualInput(true);
    }
  }, []);

  const attemptLogin = async () => {
    setIsVerifying(true);
    setError(null);

    // Resolve key again (it might have just been set in manual input)
    let key = manualKey.trim() || resolveApiKey();

    if (!key || key.length < 10) {
      setError("MANDATORY UPLINK: VALID API KEY REQUIRED.");
      setNeedsManualInput(true);
      setIsVerifying(false);
      return;
    }

    // If manual key was used, commit to vault
    if (manualKey) {
      localStorage.setItem("FORENSIC_PROTOCOL_KEY", manualKey.trim());
    }

    completeLogin();
  };

  const completeLogin = () => {
    setTimeout(() => {
      onLogin({
        id: "user_882",
        name: "Investigator Alpha",
        email: "alpha@forensic.lab",
        phone: "+1 (555) 000-0000",
        picture: "https://api.dicebear.com/7.x/identicon/svg?seed=forensic",
        isGuest: false,
      });
    }, 1200);
  };

  const handlePasteKey = async () => {
    try {
      setError(null);
      const text = await navigator.clipboard.readText();
      if (text) {
        setManualKey(text.trim());
      }
    } catch (err) {
      setError("CLIPBOARD ACCESS DENIED: PASTE MANUALLY.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Aesthetic Background Overlays */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 animate-pulse"></div>

      <div className="relative max-w-sm w-full space-y-12 text-center animate-in fade-in zoom-in-95 duration-1000">
        <header className="space-y-6">
          <div className="w-20 h-20 border-2 border-white mx-auto flex items-center justify-center relative group">
            <div className="w-3 h-3 bg-white animate-ping"></div>
            <div className="absolute inset-0 border border-white/5 scale-150 rounded-full group-hover:scale-125 transition-all duration-1000"></div>
          </div>
          <div className="space-y-2">
            <h1 className="font-mono text-4xl tracking-[0.3em] font-bold uppercase italic transition-all hover:tracking-[0.4em]">
              UPLINK GATE
            </h1>
            <p className="font-mono text-[9px] tracking-[0.4em] opacity-30 uppercase italic">
              Digital Forensic Authorization
            </p>
          </div>
        </header>

        <div className="bg-white/[0.03] border border-white/20 p-10 space-y-8 text-left relative overflow-hidden backdrop-blur-md">
          {needsManualInput ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <label className="font-mono text-[9px] opacity-40 uppercase tracking-[0.4em]">
                    Protocol Injector
                  </label>
                  <span className="font-mono text-[7px] opacity-20 uppercase tracking-widest">
                    [ANY TIER SUPPORTED]
                  </span>
                </div>

                <div className="relative flex items-center mb-6">
                  <input
                    type="password"
                    autoFocus
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="INJECT API KEY..."
                    className="w-full bg-black border border-white/20 p-5 font-mono text-[12px] tracking-widest outline-none focus:border-white transition-all pr-24 placeholder:opacity-10"
                  />
                  <button
                    onClick={handlePasteKey}
                    title="Paste from clipboard"
                    className="absolute right-3 px-3 py-2 bg-white text-black font-mono text-[8px] font-bold uppercase tracking-widest hover:bg-white/80 transition-all border border-white"
                  >
                    [PASTE]
                  </button>
                </div>

                <button
                  onClick={attemptLogin}
                  disabled={isVerifying || manualKey.length < 10}
                  className="w-full py-5 bg-white text-black font-mono text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-white/90 disabled:opacity-10 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  {isVerifying ? "SYNCING..." : "COMMIT UPLINK"}
                </button>
              </div>

              <p className="font-mono text-[7px] opacity-20 text-center uppercase tracking-widest leading-relaxed">
                Note: Environmental keys override manual injection. <br />
                Ensure your root .env is configured for auto-auth.
              </p>
            </div>
          ) : (
            <div className="space-y-8 text-center py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-[10px] tracking-widest text-green-500 uppercase">
                    Environment Uplink Active
                  </span>
                </div>
                <p className="font-mono text-[9px] opacity-40 uppercase tracking-[0.2em] leading-relaxed">
                  System detected root .env credentials. <br /> Ready for
                  forensic initialization.
                </p>
              </div>

              <button
                onClick={attemptLogin}
                disabled={isVerifying}
                className="w-full py-5 bg-white text-black font-mono text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-white/90 disabled:opacity-50 transition-all"
              >
                {isVerifying ? "SCANNING..." : "ENTER LABORATORY"}
              </button>

              <button
                onClick={() => setNeedsManualInput(true)}
                className="font-mono text-[8px] opacity-20 hover:opacity-100 uppercase tracking-widest transition-all"
              >
                [MANUAL OVERRIDE]
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-500/30 bg-red-500/5 animate-in shake duration-300">
              <p className="font-mono text-[9px] text-red-500 uppercase tracking-[0.2em] leading-relaxed text-center font-bold">
                {error}
              </p>
            </div>
          )}
        </div>

        <div className="p-8 border border-white/5 bg-white/[0.01] text-left space-y-4">
          <h2 className="font-mono text-[9px] tracking-[0.4em] opacity-20 uppercase border-b border-white/5 pb-2 italic">
            Diagnostic Info
          </h2>
          <div className="space-y-2 font-mono text-[8px] uppercase tracking-widest leading-loose">
            <div className="flex justify-between">
              <span className="opacity-30">ENCRYPTION:</span>{" "}
              <span>AES-256</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">SUBSCRIPTION:</span>{" "}
              <span className="text-white/60">HYBRID_SUPPORT</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">LOCAL_CACHE:</span>{" "}
              <span>VAULT_ACTIVE</span>
            </div>
          </div>
        </div>

        <footer className="pt-8 font-mono text-[8px] opacity-10 uppercase tracking-[0.8em] flex justify-between px-2">
          <span>PORT: 8080</span>
          <span>LOC: SECURE_CORE_A</span>
        </footer>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-in.shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
};

export default AuthPage;
